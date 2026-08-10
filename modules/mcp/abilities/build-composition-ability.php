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
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Composition_Persister;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Form_Structure_Validator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Subtree_Builder;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Composition_Ability extends Abstract_Ability {

	const CONFIGURATION_ID_ATTRIBUTE = Xml_Parser::CONFIGURATION_ID_ATTRIBUTE;
	const DEFAULT_PARENT_ID = 'document';
	const MODE_APPEND = 'append';
	const MODE_REPLACE_CHILDREN = 'replace_children';

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/build-composition';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Build Composition', 'elementor' ),
			$this->get_ability_description(),
			'elementor',
			$this->get_output_schema(),
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			$this->get_input_schema()
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$validation_error = $this->validate_input( $input );
		if ( $validation_error ) {
			return $validation_error;
		}

		$post_id = (int) $input['post_id'];
		$parent_id = $input['parent_id'] ?? self::DEFAULT_PARENT_ID;
		$dry_run = ! empty( $input['dry_run'] );
		$mode = $input['mode'] ?? self::MODE_APPEND;

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

		$xml_parser = new Xml_Parser();
		$type_resolver = new Widget_Type_Resolver( $xml_parser );
		$subtree_builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( (string) $input['xml_structure'] );
		if ( is_wp_error( $dom ) ) {
			return $dom;
		}

		$elements_data = $document->get_elements_data();
		$form_structure_error = ( new Form_Structure_Validator( $xml_parser ) )->validate(
			$dom,
			is_array( $elements_data ) ? $elements_data : [],
			$parent_id
		);

		if ( $form_structure_error ) {
			return $form_structure_error;
		}

		$widget_configs = $type_resolver->collect_used( $dom );
		if ( is_wp_error( $widget_configs ) ) {
			return $widget_configs;
		}

		$child_type_error = $type_resolver->validate_child_types( $dom, $widget_configs );
		if ( $child_type_error ) {
			return $child_type_error;
		}

		$subtrees = $subtree_builder->build( $dom, $widget_configs );
		if ( empty( $subtrees ) ) {
			return new \WP_Error(
				'empty_composition',
				__( 'xml_structure did not contain any elements. Pass raw XML tags (e.g. <e-flexbox configuration-id="..."></e-flexbox>) — do not wrap the value in <![CDATA[...]]> or other text-only content.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}
		$index = $subtree_builder->index_by_config_id( $subtrees, $dom );

		$variables_service = $this->create_variables_service();

		$config_applier = new Element_Config_Applier( $type_resolver, $this->get_plain_values_resolver() );
		$config_result = $config_applier->apply( $index, $this->as_map( $input['element_config'] ?? [] ), $widget_configs, $document );
		if ( $config_result['error'] ) {
			return $config_result['error'];
		}

		$class_applier = new Class_Applier( $this->create_global_classes_repository() );
		$class_error = $class_applier->apply( $index, $this->as_map( $input['classes'] ?? [] ) );
		if ( $class_error ) {
			return $class_error;
		}

		$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ), $this->get_active_breakpoints() );
		$style_result = $style_applier->apply( $index, $this->as_map( $input['style'] ?? [] ), 'patch', $widget_configs );
		if ( $style_result['error'] ) {
			return $style_result['error'];
		}

		$interactions_result = $this->apply_interactions( $index, $this->as_map( $input['interactions'] ?? [] ) );
		if ( $interactions_result['error'] ) {
			return $interactions_result['error'];
		}

		$warnings = array_merge( $config_result['warnings'], $style_result['warnings'], $interactions_result['warnings'] );

		if ( $dry_run ) {
			return $this->build_response( $post_id, $document, $xml_parser, $dom, [], $warnings, $mode, [] );
		}

		$persister = new Composition_Persister( $this->get_mutator(), $xml_parser );
		$persisted = $persister->insert_and_save( $document, $subtrees, $parent_id, $mode );
		if ( is_wp_error( $persisted ) ) {
			return $persisted;
		}

		$persister->embed_ids_into_dom( $dom, $persisted['tree'], $parent_id, $persisted['root_ids'] );

		return $this->build_response( $post_id, $document, $xml_parser, $dom, $persisted['root_ids'], $warnings, $mode, $persisted['removed_ids'] );
	}

	private function get_ability_description(): string {
		return Prompt_Loader::load( 'build-composition' );
	}

	private function get_output_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'success', 'post_id', 'root_element_ids', 'edit_url', 'version' ],
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
				'post_id' => [ 'type' => 'integer' ],
				'root_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'IDs of the created root-level elements.',
				],
				'edit_url' => [
					'type' => 'string',
					'format' => 'uri',
					'description' => 'Elementor editor URL for the document. Share with the user when they need a link (they must be logged into WordPress as an editor). To self-validate the render, call elementor/create-preview-link.',
				],
				'version' => [ 'type' => 'string' ],
				'resolved_xml' => [
					'type' => 'string',
					'description' => 'The XML with element IDs embedded.',
				],
				'warnings' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Non-fatal notices, e.g. props skipped because the target widget does not support them, or CSS that fell back to custom_css. The composition was still built.',
				],
				'removed_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Element IDs removed when mode is replace_children (empty when none existed).',
				],
			],
		];
	}

	private function get_input_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'post_id', 'xml_structure' ],
			'properties' => [
				'post_id' => [
					'type' => 'integer',
					'description' => 'WordPress post ID of the document to mutate.',
				],
				'xml_structure' => [
					'type' => 'string',
					'description' => 'Valid XML structure with custom Elementor widget tags. Every element MUST have a unique configuration-id attribute (e.g. <e-heading configuration-id="hero-title"></e-heading>). No attributes, classes, IDs, or text nodes in XML.',
				],
				'element_config' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → plain widget settings matching elementor://widgets/schema/{type}. Keys MUST match configuration-id attributes in xml_structure. For <e-component> configuration-ids, the value is { component_id: int, overrides?: {<override_key>: <plain value>} } — see elementor/list-components.',
				],
				'style' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks. Keys MUST match configuration-id attributes in xml_structure.',
					'additionalProperties' => [ 'type' => 'string' ],
				],
				'classes' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → list of existing global class labels to attach to that element. Create classes first via elementor/manage-classes.',
					'additionalProperties' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
				],
				'interactions' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → array of interaction items in the native shape. Read elementor://interactions/schema for the full shape and allowed enum values. Send [] for a configuration-id to clear its interactions.',
					'additionalProperties' => [
						'type' => 'array',
						'items' => [ 'type' => 'object' ],
					],
				],
				'parent_id' => [
					'type' => 'string',
					'default' => self::DEFAULT_PARENT_ID,
					'description' => 'ID of the parent container. Omit to insert at document root.',
				],
				'dry_run' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'If true, validate and return resolved tree without persisting.',
				],
				'mode' => [
					'type' => 'string',
					'enum' => [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ],
					'default' => self::MODE_APPEND,
					'description' => 'append (default) inserts under parent_id; replace_children removes existing direct children of parent_id first, then inserts.',
				],
			],
		];
	}

	private function validate_input( array $input ): ?\WP_Error {
		if ( empty( $input['post_id'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( empty( $input['xml_structure'] ) || ! is_string( $input['xml_structure'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'xml_structure is required and must be a string.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$mode = $input['mode'] ?? self::MODE_APPEND;
		$valid_modes = [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ];
		if ( ! in_array( $mode, $valid_modes, true ) ) {
			return new \WP_Error(
				'invalid_input',
				sprintf(
					/* translators: 1: Provided mode value, 2: List of valid modes */
					__( 'Invalid mode "%1$s". Must be one of: %2$s', 'elementor' ),
					$mode,
					implode( ', ', $valid_modes )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
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

	private function build_response(
		int $post_id,
		Document $document,
		Xml_Parser $xml_parser,
		\DOMDocument $dom,
		array $root_ids,
		array $warnings,
		string $mode,
		array $removed_ids
	): array {
		$post = get_post( $post_id );

		$response = [
			'success' => true,
			'post_id' => $post_id,
			'root_element_ids' => $root_ids,
			'edit_url' => $document->get_edit_url(),
			'version' => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
			'resolved_xml' => $xml_parser->serialize_children( $dom ),
		];

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		if ( self::MODE_REPLACE_CHILDREN === $mode ) {
			$response['removed_element_ids'] = $removed_ids;
		}

		return $response;
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

	private function get_plain_values_resolver(): Plain_Values_Resolver {
		return AtomicWidgetsModule::instance()->get_settings_plain_values_resolver();
	}

	/**
	 * @param array<string, array&>            $index
	 * @param array<string, array<int, array>> $interactions
	 *
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	private function apply_interactions( array &$index, array $interactions ): array {
		if ( empty( $interactions ) ) {
			return [
				'error' => null,
				'warnings' => [],
			];
		}

		if ( ! Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME ) ) {
			return [
				'error' => null,
				'warnings' => [ __( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' ) ],
			];
		}

		$applier = new Interactions_Applier( $this->get_plain_values_resolver() );

		return $applier->apply( $index, $interactions );
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	private function get_active_breakpoints(): array {
		return array_keys( Plugin::$instance->breakpoints->get_active_breakpoints() );
	}

	private function create_global_classes_repository(): Global_Classes_Repository {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}
}
