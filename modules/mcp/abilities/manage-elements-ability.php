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
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Elements_Ability extends Abstract_Ability {

	const MAX_BATCH_SIZE = 50;

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
			__( 'Bulk surgical edits on existing V4 elements in a document (up to 50 operations applied to a single document tree, saved once). Each operation: action=update merges partial plain settings, raw-CSS style, global class labels, and native-shape interactions; action=delete removes the element; action=move re-parents it under new_parent_id at optional index; action=duplicate clones the element (with fresh ids) right after the source.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results', 'post_id' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
					'post_id' => [ 'type' => 'integer' ],
					'version' => [ 'type' => 'string' ],
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
				'required' => [ 'post_id', 'operations' ],
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'operations' => [
						'type' => 'array',
						'description' => 'Bulk operations (1–50) applied in order to a single document tree, saved once at the end. Partial success is supported: failed ops return per-op errors while sibling valid ops still apply.',
						'items' => [
							'type' => 'object',
							'required' => [ 'action', 'element_id' ],
							'properties' => [
								'action' => [
									'type' => 'string',
									'enum' => [ 'update', 'delete', 'move', 'duplicate' ],
								],
								'element_id' => [ 'type' => 'string' ],
								'settings' => [
									'type' => 'object',
									'description' => 'update only: partial plain settings map merged onto existing settings.',
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
								'interactions' => [
									'type' => 'array',
									'items' => [ 'type' => 'object' ],
									'description' => 'update only: array of interaction items in the native shape. Replaces existing interactions on the element; send [] to clear. Read elementor://interactions/schema for the full shape.',
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
						],
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		if ( empty( $input['post_id'] ) ) {
			return $this->bad_request( __( 'post_id is required.', 'elementor' ) );
		}

		$operations = $input['operations'] ?? null;
		if ( ! is_array( $operations ) ) {
			return $this->bad_request( __( 'operations array is required.', 'elementor' ) );
		}

		if ( empty( $operations ) ) {
			return $this->bad_request( __( 'operations must not be empty.', 'elementor' ) );
		}

		if ( count( $operations ) > self::MAX_BATCH_SIZE ) {
			return new \WP_Error(
				'batch_size_exceeded',
				sprintf(
					/* translators: %d: maximum operations per request */
					__( 'Maximum %d operations per request.', 'elementor' ),
					self::MAX_BATCH_SIZE
				),
				[
					'status' => \WP_Http::BAD_REQUEST,
					'max_allowed' => self::MAX_BATCH_SIZE,
				]
			);
		}

		$post_id = (int) $input['post_id'];

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

		return $this->handle_bulk( $document, $operations );
	}

	private function handle_bulk( Document $document, array $operations ): array {
		$results = new Bulk_Operations_Result();
		$tree = $this->get_tree( $document );
		$any_change = false;

		foreach ( $operations as $index => $operation ) {
			$index = (int) $index;

			if ( ! is_array( $operation ) ) {
				$results->add_error( $index, '', 'invalid_input', __( 'Invalid operation.', 'elementor' ) );
				continue;
			}

			$action = $operation['action'] ?? '';
			$element_id = $operation['element_id'] ?? '';

			if ( ! is_string( $element_id ) || '' === $element_id ) {
				$results->add_error( $index, $action, 'invalid_input', __( 'element_id is required.', 'elementor' ) );
				continue;
			}

			$outcome = $this->apply_operation( $tree, $action, $element_id, $operation );

			if ( is_wp_error( $outcome ) ) {
				$results->add_error( $index, $action, $outcome->get_error_code(), $outcome->get_error_message() );
				continue;
			}

			$tree = $outcome['tree'];
			$any_change = true;

			$extra = [ 'element_id' => $element_id ];
			if ( ! empty( $outcome['warnings'] ) ) {
				$extra['warnings'] = $outcome['warnings'];
			}
			$results->add_success( $index, $action, $extra );
		}

		$response = $results->to_array();
		$response['post_id'] = (int) $document->get_main_id();

		if ( ! $any_change ) {
			return $response;
		}

		$save_result = $this->get_mutator()->save_as_draft( $document, $tree );
		if ( is_wp_error( $save_result ) || ! $save_result ) {
			$response['status'] = 'error';
			$response['save_error'] = is_wp_error( $save_result )
				? $save_result->get_error_message()
				: __( 'Could not save document.', 'elementor' );
			return $response;
		}

		Plugin::$instance->files_manager->clear_cache();

		$post = get_post( $document->get_main_id() );
		$response['version'] = $post ? $post->post_modified_gmt : current_time( 'mysql', true );

		return $response;
	}

	private function apply_operation( array $tree, string $action, string $element_id, array $operation ) {
		switch ( $action ) {
			case 'update':
				return $this->apply_update( $tree, $element_id, $operation );
			case 'delete':
				return $this->apply_delete( $tree, $element_id );
			case 'move':
				return $this->apply_move( $tree, $element_id, $operation );
			case 'duplicate':
				return $this->apply_duplicate( $tree, $element_id );
			default:
				return new \WP_Error(
					'invalid_input',
					sprintf(
						/* translators: %s: action name */
						__( 'Unknown action: %s.', 'elementor' ),
						$action
					)
				);
		}
	}

	private function apply_delete( array $tree, string $element_id ) {
		$new_tree = $this->get_mutator()->remove( $tree, $element_id );
		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return [
			'tree' => $new_tree,
			'warnings' => [],
		];
	}

	private function apply_duplicate( array $tree, string $element_id ) {
		$new_tree = $this->get_mutator()->duplicate( $tree, $element_id );
		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return [
			'tree' => $new_tree,
			'warnings' => [],
		];
	}

	private function apply_move( array $tree, string $element_id, array $operation ) {
		$new_parent_id = $operation['new_parent_id'] ?? '';
		if ( ! is_string( $new_parent_id ) || '' === $new_parent_id ) {
			return new \WP_Error( 'invalid_input', __( 'new_parent_id is required for action=move.', 'elementor' ) );
		}

		$index = array_key_exists( 'index', $operation ) && null !== $operation['index'] ? (int) $operation['index'] : null;

		$new_tree = $this->get_mutator()->move( $tree, $element_id, $new_parent_id, $index );
		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return [
			'tree' => $new_tree,
			'warnings' => [],
		];
	}

	private function apply_update( array $tree, string $element_id, array $operation ) {
		$settings = $this->as_map( $operation['settings'] ?? [] );
		$style = $this->as_map( $operation['style'] ?? [] );
		$classes = $operation['classes'] ?? null;
		$interactions = $operation['interactions'] ?? null;

		$has_change = ! empty( $settings ) || ! empty( $style ) || ! empty( $classes ) || null !== $interactions;
		if ( ! $has_change ) {
			return new \WP_Error( 'invalid_input', __( 'update requires at least one of settings, style, classes, or interactions.', 'elementor' ) );
		}

		if ( null === $this->get_mutator()->find_by_id( $tree, $element_id ) ) {
			return new \WP_Error( 'elementor_not_found', __( 'Element not found.', 'elementor' ) );
		}

		$index = $this->get_mutator()->build_ref_index( $tree, $element_id );
		if ( empty( $index ) ) {
			return new \WP_Error( 'elementor_not_found', __( 'Element not found.', 'elementor' ) );
		}

		$node_snapshot = $index[ $element_id ];
		$element_type = $node_snapshot['widgetType'] ?? $node_snapshot['elType'] ?? null;
		if ( ! $element_type ) {
			return new \WP_Error( 'invalid_input', __( 'Element has no resolvable type.', 'elementor' ) );
		}

		$xml_parser = new Xml_Parser();
		$type_resolver = new Widget_Type_Resolver( $xml_parser );
		$widget_config = $type_resolver->resolve_type_config( $element_type );
		if ( is_wp_error( $widget_config ) ) {
			return $widget_config;
		}
		$widget_configs = [ $element_type => $widget_config ];

		$variables_service = $this->create_variables_service();
		$warnings = [];

		if ( ! empty( $settings ) ) {
			$config_applier = new Element_Config_Applier( $type_resolver, $this->get_plain_values_resolver() );
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
				return new \WP_Error( 'invalid_input', __( 'classes must be an array of global class labels.', 'elementor' ) );
			}
			$class_applier = new Class_Applier( $this->create_global_classes_repository() );
			$class_error = $class_applier->apply( $index, [ $element_id => $classes ] );
			if ( $class_error ) {
				return $class_error;
			}
		}

		if ( ! empty( $style ) ) {
			$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ) );
			$style_result = $style_applier->apply( $index, [ $element_id => $style ], [ $element_id => $element_type ] );
			if ( $style_result['error'] ) {
				return $style_result['error'];
			}
			$warnings = array_merge( $warnings, $style_result['warnings'] );
		}

		if ( null !== $interactions ) {
			if ( ! is_array( $interactions ) ) {
				return new \WP_Error( 'invalid_input', __( 'interactions must be an array of interaction items.', 'elementor' ) );
			}
			if ( ! Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME ) ) {
				$warnings[] = __( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' );
			} else {
				$interactions_applier = new Interactions_Applier( $this->get_plain_values_resolver() );
				$interactions_result = $interactions_applier->apply( $index, [ $element_id => $interactions ] );
				if ( $interactions_result['error'] ) {
					return $interactions_result['error'];
				}
				$warnings = array_merge( $warnings, $interactions_result['warnings'] );
			}
		}

		return [
			'tree' => $tree,
			'warnings' => $warnings,
		];
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

	private function get_plain_values_resolver(): Plain_Values_Resolver {
		return AtomicWidgetsModule::instance()->get_settings_plain_values_resolver();
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}
}
