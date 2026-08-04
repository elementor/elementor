<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Components\Circular_Dependency_Validator;
use Elementor\Modules\Components\Components_Access_Controller;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Non_Atomic_Widget_Validator;
use Elementor\Modules\Components\Save_Components_Validator;
use Elementor\Modules\Mcp\Abilities\Utils\Composition_Compiler;
use Elementor\Modules\Mcp\Abilities\Utils\Insufficient_Permissions_Error;
use Elementor\Modules\Mcp\Abilities\Utils\Overridable_Props_Builder;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Component_Ability extends Abstract_Ability {

	const ACTION_CREATE = 'create';
	const ACTION_UPDATE = 'update';
	const ACTION_RENAME = 'rename';
	const ACTION_ARCHIVE = 'archive';
	const ACTION_PUBLISH = 'publish';

	private ?Components_Repository $repository;

	public function __construct( ?Components_Repository $repository = null ) {
		$this->repository = $repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-component';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Component', 'elementor' ),
			Prompt_Loader::load( 'manage-component' ),
			'elementor',
			$this->get_output_schema(),
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'manage_options' ),
			$this->get_input_schema()
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		switch ( $input['action'] ?? null ) {
			case self::ACTION_CREATE:
				return $this->handle_create( $input );
			case self::ACTION_UPDATE:
				return $this->handle_update( $input );
			case self::ACTION_RENAME:
				return $this->handle_rename( $input );
			case self::ACTION_ARCHIVE:
				return $this->handle_archive( $input );
			case self::ACTION_PUBLISH:
				return $this->handle_publish( $input );
		}

		return $this->invalid_input( __( 'action must be one of: create, update, rename, archive, publish.', 'elementor' ) );
	}

	private function handle_create( array $input ) {
		$gate = $this->check_access( self::ACTION_CREATE, fn() => Components_Access_Controller::can_create() );
		if ( $gate ) {
			return $gate;
		}

		$title = isset( $input['title'] ) ? trim( (string) $input['title'] ) : '';
		if ( strlen( $title ) < 2 ) {
			return $this->invalid_input( __( 'create requires a title of at least 2 characters.', 'elementor' ) );
		}

		$source_result = $this->resolve_create_elements( $input );
		if ( is_wp_error( $source_result ) ) {
			return $source_result;
		}
		[ 'elements' => $elements, 'warnings' => $warnings ] = $source_result;

		$settings = [];
		$overridable_error = $this->apply_overridable_props( $elements, $input, $settings );
		if ( is_wp_error( $overridable_error ) ) {
			return $overridable_error;
		}

		$uid = $this->generate_uid();
		$item = [
			'uid' => $uid,
			'title' => $title,
			'elements' => $elements,
			'settings' => $settings,
		];
		$items = Collection::make( [ $item ] );

		$save_validation = Save_Components_Validator::make( $this->get_repository()->all() )->validate( $items );
		if ( ! $save_validation['success'] ) {
			return new \WP_Error(
				'components_validation_failed',
				__( 'Validation failed: ', 'elementor' ) . implode( ' ', $save_validation['messages'] ),
				[ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ]
			);
		}

		$circular_validation = Circular_Dependency_Validator::make()->validate_new_components( $items );
		if ( ! $circular_validation['success'] ) {
			return new \WP_Error(
				'circular_dependency_detected',
				__( "Can't add this component - components that contain each other can't be nested.", 'elementor' ),
				[
					'status' => \WP_Http::UNPROCESSABLE_ENTITY,
					'caused_by' => $circular_validation['messages'],
				]
			);
		}

		$non_atomic_validation = Non_Atomic_Widget_Validator::make()->validate_items( $items );
		if ( ! $non_atomic_validation['success'] ) {
			return new \WP_Error(
				Non_Atomic_Widget_Validator::ERROR_CODE,
				__( 'Components require atomic elements only. Remove widgets to create this component.', 'elementor' ),
				[
					'status' => \WP_Http::UNPROCESSABLE_ENTITY,
					'non_atomic_elements' => $non_atomic_validation['non_atomic_elements'],
				]
			);
		}

		try {
			$component_id = $this->get_repository()->create( $title, $elements, $this->resolve_status( $input ), $uid, $settings );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'create_failed', $e->getMessage(), [ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ] );
		}

		$component = $this->get_repository()->get( $component_id, false );

		$response = [
			'success' => true,
			'component_id' => $component_id,
			'uid' => $uid,
		] + $this->document_links( $component );

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		return $response;
	}

	private function handle_update( array $input ) {
		$gate = $this->check_access( self::ACTION_UPDATE, fn() => Components_Access_Controller::can_edit() );
		if ( $gate ) {
			return $gate;
		}

		$component_id = isset( $input['component_id'] ) ? (int) $input['component_id'] : 0;
		if ( $component_id <= 0 ) {
			return $this->invalid_input( __( 'update requires component_id.', 'elementor' ) );
		}

		$component = $this->get_repository()->get_for_edit( $component_id, $this->resolve_status( $input ) );
		if ( ! $component ) {
			return $this->not_found( __( 'Component not found.', 'elementor' ) );
		}

		$has_xml = ! empty( $input['xml_structure'] ) && is_string( $input['xml_structure'] );

		return $has_xml
			? $this->update_with_xml( $component, $input )
			: $this->update_overridable_props_only( $component, $input );
	}

	private function handle_rename( array $input ) {
		$gate = $this->check_access( self::ACTION_RENAME, fn() => Components_Access_Controller::can_rename() );
		if ( $gate ) {
			return $gate;
		}

		$component_id = isset( $input['component_id'] ) ? (int) $input['component_id'] : 0;
		$title = isset( $input['title'] ) ? trim( (string) $input['title'] ) : '';

		if ( $component_id <= 0 || strlen( $title ) < 2 ) {
			return $this->invalid_input( __( 'rename requires component_id and a title of at least 2 characters.', 'elementor' ) );
		}

		$success = $this->get_repository()->update_title( $component_id, $title, $this->resolve_status( $input ) );
		if ( ! $success ) {
			return $this->not_found( __( 'Component not found or title could not be updated.', 'elementor' ) );
		}

		return [
			'success' => true,
			'component_id' => $component_id,
		];
	}

	private function handle_archive( array $input ) {
		$gate = $this->check_access( self::ACTION_ARCHIVE, fn() => Components_Access_Controller::can_delete() );
		if ( $gate ) {
			return $gate;
		}

		$component_ids = $this->normalize_ids( $input['component_ids'] ?? [] );
		if ( empty( $component_ids ) ) {
			return $this->invalid_input( __( 'archive requires a non-empty component_ids array of positive integers.', 'elementor' ) );
		}

		$result = $this->get_repository()->archive( $component_ids, $this->resolve_status( $input ) );

		return [
			'success' => empty( $result['failedIds'] ),
			'success_ids' => $result['successIds'],
			'failed_ids' => $result['failedIds'],
		];
	}

	private function handle_publish( array $input ) {
		$gate = $this->check_access( self::ACTION_PUBLISH, fn() => Components_Access_Controller::can_publish() );
		if ( $gate ) {
			return $gate;
		}

		$component_id = isset( $input['component_id'] ) ? (int) $input['component_id'] : 0;
		if ( $component_id <= 0 ) {
			return $this->invalid_input( __( 'publish requires component_id.', 'elementor' ) );
		}

		$component = $this->get_repository()->get( $component_id );
		if ( ! $component ) {
			return $this->not_found( __( 'Component not found.', 'elementor' ) );
		}

		if ( ! $this->get_repository()->publish_component( $component ) ) {
			return new \WP_Error(
				'publish_failed',
				__( 'Failed to publish component.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$published = $this->get_repository()->get( $component->get_main_id(), false );

		return [
			'success' => true,
			'component_id' => $component->get_main_id(),
		] + $this->document_links( $published );
	}

	private function update_overridable_props_only( Component_Document $component, array $input ) {
		if ( ! is_array( $input['overridable_props'] ?? null ) ) {
			return $this->invalid_input( __( 'update without xml_structure requires overridable_props.', 'elementor' ) );
		}

		$elements = $component->get_elements_data();
		$settings = [];

		$overridable_error = $this->apply_overridable_props( $elements, $input, $settings );
		if ( is_wp_error( $overridable_error ) ) {
			return $overridable_error;
		}

		return $this->save_component( $component, $elements, $settings );
	}

	private function update_with_xml( Component_Document $component, array $input ) {
		$compiled = $this->compile_composition( $input, $component );
		if ( is_wp_error( $compiled ) ) {
			return $compiled;
		}

		$elements = $this->assign_element_ids( $compiled['elements'] );
		$warnings = $compiled['warnings'];

		$non_atomic_validation = Non_Atomic_Widget_Validator::make()->validate( $elements );
		if ( ! $non_atomic_validation['success'] ) {
			return new \WP_Error(
				Non_Atomic_Widget_Validator::ERROR_CODE,
				__( 'Components require atomic elements only. Remove widgets to create this component.', 'elementor' ),
				[
					'status' => \WP_Http::UNPROCESSABLE_ENTITY,
					'non_atomic_elements' => $non_atomic_validation['non_atomic_elements'],
				]
			);
		}

		$settings = [];
		$overridable_error = $this->apply_overridable_props( $elements, $input, $settings );
		if ( is_wp_error( $overridable_error ) ) {
			return $overridable_error;
		}

		$result = $this->save_component( $component, $elements, $settings );
		if ( is_wp_error( $result ) || empty( $warnings ) ) {
			return $result;
		}

		return $result + [ 'warnings' => $warnings ];
	}

	private function save_component( Component_Document $component, array $elements, array $settings ) {
		try {
			$saved = $component->save( [
				'elements' => $elements,
				'settings' => $settings,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error( 'save_failed', $e->getMessage(), [ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ] );
		}

		if ( ! $saved ) {
			return new \WP_Error( 'save_failed', __( 'Failed to save component.', 'elementor' ), [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return [
			'success' => true,
			'component_id' => $component->get_main_id(),
		] + $this->document_links( $component );
	}

	/**
	 * @return array{elements: array[], warnings: string[]}|\WP_Error
	 */
	private function resolve_create_elements( array $input ) {
		$has_xml = ! empty( $input['xml_structure'] ) && is_string( $input['xml_structure'] );
		$has_source_element = ! empty( $input['source_post_id'] ) && ! empty( $input['element_id'] );

		if ( $has_xml && $has_source_element ) {
			return $this->invalid_input( __( 'create accepts either xml_structure or source_post_id/element_id, not both.', 'elementor' ) );
		}

		if ( $has_xml ) {
			return $this->compile_elements_from_xml( $input );
		}

		if ( $has_source_element ) {
			return $this->copy_elements_from_source( $input );
		}

		return [
			'elements' => [],
			'warnings' => [],
		];
	}

	/**
	 * @return array{elements: array[], warnings: string[]}|\WP_Error
	 */
	private function compile_elements_from_xml( array $input ) {
		$compiled = $this->compile_composition( $input );

		if ( is_wp_error( $compiled ) ) {
			return $compiled;
		}

		return [
			'elements' => $this->assign_element_ids( $compiled['elements'] ),
			'warnings' => $compiled['warnings'],
		];
	}

	/**
	 * @return array{elements: array[], warnings: string[], dom: \DOMDocument, xml_parser: \Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser}|\WP_Error
	 */
	private function compile_composition( array $input, ?Document $document = null ) {
		$compiled = Composition_Compiler::make()->compile( $input, $document );
		if ( is_wp_error( $compiled ) ) {
			return $compiled;
		}

		if ( 1 !== count( $compiled['elements'] ) ) {
			return new \WP_Error(
				'component_requires_single_root',
				__( 'A component composition must contain exactly one root element.', 'elementor' ),
				[ 'status' => \WP_Http::UNPROCESSABLE_ENTITY ]
			);
		}

		return $compiled;
	}

	/**
	 * @return array{elements: array[], warnings: string[]}|\WP_Error
	 */
	private function copy_elements_from_source( array $input ) {
		$source_post_id = (int) $input['source_post_id'];
		$element_id = (string) $input['element_id'];

		if ( ! current_user_can( 'edit_post', $source_post_id ) ) {
			return new \WP_Error(
				'elementor_forbidden',
				__( 'You do not have permission to read source_post_id.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$document = Plugin::$instance->documents->get_doc_or_auto_save( $source_post_id, get_current_user_id() )
			?? Plugin::$instance->documents->get( $source_post_id );

		if ( ! $document ) {
			return $this->not_found( __( 'source_post_id not found.', 'elementor' ) );
		}

		$found = Document_Mutator::instance()->find_by_id( $document->get_elements_data(), $element_id );
		if ( null === $found ) {
			return $this->not_found( __( 'element_id was not found on source_post_id.', 'elementor' ) );
		}

		return [
			'elements' => $this->assign_element_ids( [ $found ] ),
			'warnings' => [],
		];
	}

	/**
	 * Builds the native overridable-props payload and stamps `overridable` envelopes
	 * onto the referenced element settings. Validation and persistence of the native
	 * payload itself is left to the component document's save hook, which already
	 * parses and persists it for every component save.
	 *
	 * @return \WP_Error|null
	 */
	private function apply_overridable_props( array &$elements, array $input, array &$settings ) {
		if ( ! is_array( $input['overridable_props'] ?? null ) || empty( $input['overridable_props'] ) ) {
			return null;
		}

		$builder_result = Overridable_Props_Builder::make()->build( $elements, $input['overridable_props'] );
		if ( is_wp_error( $builder_result ) ) {
			return $builder_result;
		}

		$settings['overridable_props'] = $builder_result;

		return null;
	}

	/**
	 * Compiled subtrees have no ids yet (`Subtree_Builder` never sets one), and copied
	 * subtrees carry ids from another document that would collide here. Both paths need
	 * fresh, slug-safe machine ids; the caller's configuration-id stays on
	 * `editor_settings.title` so `overridable_props.target` and other tools can still
	 * address elements by the identifier the caller used in `xml_structure` — see
	 * `Overridable_Props_Builder::find_element_ref`.
	 */
	private function assign_element_ids( array $elements ): array {
		return array_map( fn( array $element ) => $this->assign_element_id( $element ), $elements );
	}

	private function assign_element_id( array $element ): array {
		$element['id'] = Document_Mutator::instance()->generate_id();

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = array_map( fn( array $child ) => $this->assign_element_id( $child ), $element['elements'] );
		}

		return $element;
	}

	private function document_links( Component_Document $component ): array {
		$editor_url = $component->get_edit_url();

		return [
			'editor_url' => $editor_url,
			'llm_instructions' => sprintf(
				/* translators: %s: Component editor URL. */
				__( 'You MUST show the user this link to review the component: %s', 'elementor' ),
				$editor_url
			),
		];
	}

	private function resolve_status( array $input ): string {
		return 'draft' === ( $input['publish_status'] ?? 'publish' ) ? Document::STATUS_DRAFT : Document::STATUS_PUBLISH;
	}

	private function generate_uid(): string {
		return 'component-' . wp_generate_uuid4();
	}

	private function normalize_ids( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return [];
		}

		$ids = [];
		foreach ( $raw as $value ) {
			$id = (int) $value;
			if ( $id > 0 ) {
				$ids[ $id ] = $id;
			}
		}

		return array_values( $ids );
	}

	private function check_access( string $action, callable $can ): ?\WP_Error {
		return $can() ? null : Insufficient_Permissions_Error::for_action( $action );
	}

	private function invalid_input( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function not_found( string $message ): \WP_Error {
		return new \WP_Error( 'elementor_not_found', $message, [ 'status' => \WP_Http::NOT_FOUND ] );
	}

	private function get_repository(): Components_Repository {
		if ( ! $this->repository ) {
			$this->repository = new Components_Repository();
		}

		return $this->repository;
	}

	private function get_output_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
				'component_id' => [ 'type' => 'integer' ],
				'uid' => [
					'type' => 'string',
					'description' => 'Server-generated component uid, only present for create.',
				],
				'success_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'integer' ],
					'description' => 'archive only.',
				],
				'failed_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'integer' ],
					'description' => 'archive only.',
				],
				'editor_url' => [
					'type' => 'string',
					'description' => 'Component documents have no public permalink; this is the editor URL to review the change.',
				],
				'llm_instructions' => [
					'type' => 'string',
					'description' => 'Mandatory next step: include this text (with the editor link) in your reply to the user.',
				],
				'warnings' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Non-fatal notices from XML compilation, e.g. props skipped or CSS that fell back to custom_css.',
				],
			],
		];
	}

	private function get_input_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'action' ],
			'properties' => [
				'action' => [
					'type' => 'string',
					'enum' => [ self::ACTION_CREATE, self::ACTION_UPDATE, self::ACTION_RENAME, self::ACTION_ARCHIVE, self::ACTION_PUBLISH ],
				],
				'title' => [
					'type' => 'string',
					'minLength' => 2,
					'maxLength' => 200,
					'description' => 'create: component title. rename: the new title.',
				],
				'source_post_id' => [
					'type' => 'integer',
					'description' => 'create: WordPress post id to copy an existing element subtree from. Requires element_id. Mutually exclusive with xml_structure.',
				],
				'element_id' => [
					'type' => 'string',
					'description' => 'create: id of the element (within source_post_id, from elementor/get-page-structure) to copy as the component root.',
				],
				'xml_structure' => [
					'type' => 'string',
					'description' => 'create/update: same tag language as elementor/build-composition, with exactly one root element. Mutually exclusive with source_post_id/element_id.',
				],
				'element_config' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Same shape as elementor/build-composition element_config. Only used with xml_structure.',
				],
				'classes' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Same shape as elementor/build-composition classes. Only used with xml_structure.',
				],
				'style' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Same shape as elementor/build-composition style. Only used with xml_structure.',
				],
				'interactions' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Same shape as elementor/build-composition interactions. Only used with xml_structure.',
				],
				'overridable_props' => [
					'type' => 'object',
					'description' => 'Record mapping override-key → { target, prop_key, label, group? }. target identifies the element to expose: for xml_structure, use the same configuration-id you set on that element; for source_post_id/element_id (create) or an update without xml_structure, use the real element id (from elementor/get-page-structure). override keys, groupIds, and origin values are generated server-side.',
				],
				'publish_status' => [
					'type' => 'string',
					'enum' => [ 'publish', 'draft' ],
					'default' => 'publish',
					'description' => 'create: initial document status. update/rename/archive: "draft" edits an autosave copy instead of the live document; the change is not visible on pages using this component until you publish it.',
				],
				'component_id' => [
					'type' => 'integer',
					'description' => 'update/rename/publish target component id.',
				],
				'component_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'integer' ],
					'description' => 'archive targets.',
				],
			],
		];
	}
}
