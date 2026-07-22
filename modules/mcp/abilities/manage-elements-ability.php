<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Elements_Ability extends Abstract_Ability {

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-elements';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elements', 'elementor' ),
			__( 'Surgical edits on existing V4 elements in a document. action=update merges partial plain settings, raw-CSS style, and global class labels; action=delete removes the element; action=move re-parents it under new_parent_id at optional index; action=duplicate clones the element (with fresh ids) right after the source.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'post_id' => [ 'type' => 'integer' ],
					'element_id' => [ 'type' => 'string' ],
					'version' => [ 'type' => 'string' ],
					'warnings' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'required' => [ 'action', 'post_id', 'element_id' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => [ 'update', 'delete', 'move', 'duplicate' ],
					],
					'post_id' => [ 'type' => 'integer' ],
					'element_id' => [ 'type' => 'string' ],
					'settings' => [
						'type' => 'object',
						'description' => 'update only: partial plain settings map merged onto existing settings (same plain format as build-composition element_config; no $$type envelopes).',
					],
					'style' => [
						'type' => 'object',
						'description' => 'update only: raw CSS declarations (property → value); null resets a property.',
					],
					'classes' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
						'description' => 'update only: global class labels to attach (prepended to existing).',
					],
					'new_parent_id' => [
						'type' => 'string',
						'description' => "move only: target parent id or 'document' for root.",
					],
					'index' => [
						'type' => [ 'integer', 'null' ],
						'description' => 'move only: insertion index within new_parent_id (null = append).',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$action = $input['action'] ?? '';

		if ( empty( $input['post_id'] ) ) {
			return $this->bad_request( __( 'post_id is required.', 'elementor' ) );
		}

		if ( empty( $input['element_id'] ) || ! is_string( $input['element_id'] ) ) {
			return $this->bad_request( __( 'element_id is required.', 'elementor' ) );
		}

		$post_id = (int) $input['post_id'];
		$element_id = (string) $input['element_id'];

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'elementor_forbidden',
				__( 'You do not have permission to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$document = $this->resolve_document( $post_id );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		switch ( $action ) {
			case 'update':
				return $this->handle_update( $document, $element_id, $input );
			case 'delete':
				return $this->handle_delete( $document, $element_id );
			case 'move':
				return $this->handle_move( $document, $element_id, $input );
			case 'duplicate':
				return $this->handle_duplicate( $document, $element_id );
			default:
				return $this->bad_request( sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function handle_delete( Document $document, string $element_id ) {
		$tree = $this->get_tree( $document );
		$new_tree = $this->get_mutator()->remove( $tree, $element_id );

		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return $this->save_and_respond( $document, $new_tree, $element_id, [] );
	}

	private function handle_duplicate( Document $document, string $element_id ) {
		$tree = $this->get_tree( $document );
		$new_tree = $this->get_mutator()->duplicate( $tree, $element_id );

		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return $this->save_and_respond( $document, $new_tree, $element_id, [] );
	}

	private function handle_move( Document $document, string $element_id, array $input ) {
		$new_parent_id = $input['new_parent_id'] ?? '';
		if ( ! is_string( $new_parent_id ) || '' === $new_parent_id ) {
			return $this->bad_request( __( 'new_parent_id is required for action=move.', 'elementor' ) );
		}

		$index = array_key_exists( 'index', $input ) && null !== $input['index'] ? (int) $input['index'] : null;

		$tree = $this->get_tree( $document );
		$new_tree = $this->get_mutator()->move( $tree, $element_id, $new_parent_id, $index );

		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return $this->save_and_respond( $document, $new_tree, $element_id, [] );
	}

	private function handle_update( Document $document, string $element_id, array $input ) {
		$settings = $this->as_map( $input['settings'] ?? [] );
		$style = $this->as_map( $input['style'] ?? [] );
		$classes = $input['classes'] ?? null;

		$has_change = ! empty( $settings ) || ! empty( $style ) || ! empty( $classes );
		if ( ! $has_change ) {
			return $this->bad_request( __( 'update requires at least one of settings, style, or classes.', 'elementor' ) );
		}

		$tree = $this->get_tree( $document );

		if ( null === $this->get_mutator()->find_by_id( $tree, $element_id ) ) {
			return $this->not_found( __( 'Element not found.', 'elementor' ) );
		}

		$index = $this->get_mutator()->build_ref_index( $tree, $element_id );
		if ( empty( $index ) ) {
			return $this->not_found( __( 'Element not found.', 'elementor' ) );
		}

		$node_snapshot = $index[ $element_id ];
		$tag = $node_snapshot['widgetType'] ?? $node_snapshot['elType'] ?? null;
		if ( ! $tag ) {
			return $this->bad_request( __( 'Element has no resolvable type.', 'elementor' ) );
		}

		$xml_parser = new Xml_Parser();
		$type_resolver = new Widget_Type_Resolver( $xml_parser );
		$widget_config = $type_resolver->resolve_type_config( $tag );
		if ( is_wp_error( $widget_config ) ) {
			return $widget_config;
		}
		$widget_configs = [ $tag => $widget_config ];

		$variables_service = $this->create_variables_service();
		$warnings = [];

		if ( ! empty( $settings ) ) {
			$plain_values_resolver = AtomicWidgetsModule::instance()->get_settings_plain_values_resolver( $variables_service );
			$config_applier = new Element_Config_Applier( $type_resolver, $plain_values_resolver );
			$config_result = $config_applier->apply(
				$index,
				[ $element_id => $settings ],
				$widget_configs
			);
			if ( $config_result['error'] ) {
				return $config_result['error'];
			}
			$warnings = array_merge( $warnings, $config_result['warnings'] );
		}

		if ( ! empty( $classes ) ) {
			if ( ! is_array( $classes ) ) {
				return $this->bad_request( __( 'classes must be an array of global class labels.', 'elementor' ) );
			}
			$class_applier = new Class_Applier( $this->create_global_classes_repository() );
			$class_error = $class_applier->apply( $index, [ $element_id => $classes ] );
			if ( $class_error ) {
				return $class_error;
			}
		}

		if ( ! empty( $style ) ) {
			$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ) );
			$style_result = $style_applier->apply( $index, [ $element_id => $style ] );
			if ( $style_result['error'] ) {
				return $style_result['error'];
			}
			$warnings = array_merge( $warnings, $style_result['warnings'] );
		}

		return $this->save_and_respond( $document, $tree, $element_id, $warnings );
	}

	private function save_and_respond( Document $document, array $tree, string $element_id, array $warnings ) {
		$save_result = $this->get_mutator()->save_as_draft( $document, $tree );

		if ( is_wp_error( $save_result ) ) {
			return $save_result;
		}

		if ( ! $save_result ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		Plugin::$instance->files_manager->clear_cache();

		$post = get_post( $document->get_main_id() );

		$response = [
			'status' => 'ok',
			'post_id' => (int) $document->get_main_id(),
			'element_id' => $element_id,
			'version' => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
		];

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		return $response;
	}

	private function resolve_document( int $post_id ) {
		$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id, get_current_user_id() )
			?? Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $document;
	}

	private function get_tree( Document $document ): array {
		$tree = $document->get_elements_data();

		return is_array( $tree ) ? $tree : [];
	}

	private function to_public_error( \WP_Error $error ): \WP_Error {
		$data = $error->get_error_data();
		$status = is_array( $data ) && isset( $data['status'] ) ? $data['status'] : \WP_Http::NOT_FOUND;

		if ( \WP_Http::NOT_FOUND === $status ) {
			return new \WP_Error( 'elementor_not_found', $error->get_error_message(), [ 'status' => $status ] );
		}

		return $error;
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function not_found( string $message ): \WP_Error {
		return new \WP_Error( 'elementor_not_found', $message, [ 'status' => \WP_Http::NOT_FOUND ] );
	}

	private function as_map( $value ): array {
		if ( is_object( $value ) ) {
			$value = (array) $value;
		}

		return is_array( $value ) ? $value : [];
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}

	private function create_global_classes_repository(): Global_Classes_Repository {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}

	private function create_css_converter( ?Variables_Service $variables_service ): Css_Converter {
		$variable_transformer = $variables_service
			? new Variable_Prop_Value_Transformer( $variables_service )
			: null;

		return new Css_Converter(
			Converter_Registry_Factory::create( $variables_service ),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create( $variables_service ),
			$variable_transformer
		);
	}

	private function create_variables_service(): ?Variables_Service {
		if ( ! $this->is_variables_active() ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return null;
		}

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}
}
