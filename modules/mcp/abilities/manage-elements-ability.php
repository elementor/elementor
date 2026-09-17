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
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Modules\Interactions\Module as Interactions_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\Class_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Component_Instance_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Element_Config_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Interactions_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Widget_Type_Resolver;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Modules\Mcp\Abilities\Utils\Tool_Performance_Metrics;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Modules\Mcp\Events\Mcp_Event_Dispatcher;
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
			sprintf(
				/* translators: %s: comma-separated list of V3-allowlisted widget types. */
				__( 'Bulk surgical edits on existing V4 (atomic) elements in a document (up to 50 operations applied to a single document tree, saved once). V4 elements and a closed V3 allowlist (%s — see elementor/list-widget-schemas) can be operation targets. Allowlisted V3 updates: settings merge raw without schema validation; classes are written to V3\'s space-separated _css_classes; style CSS is wrapped in `selector { ... }` and stored in V3\'s custom_css (requires Elementor Pro, otherwise emits a warning). Other V3 targets return elementor_v3_not_supported per-op and must be edited directly in the Elementor editor. new_parent_id on action=move may reference either V3 or V4 containers. Each operation: action=update merges partial plain settings, plain-CSS string style (with pseudo-state and breakpoint support; breakpoints use @media (--mobile) syntax — NOT pixel queries), global class labels, and native-shape interactions; action=delete removes the element; action=move re-parents it under new_parent_id at optional index; action=duplicate clones the element (with fresh ids) right after the source. WARNING: This tool performs a read-modify-write on the current document. Do NOT use element IDs obtained from a prior get-page-structure read if build-composition was called in between — use only IDs from the build-composition resolved_xml response to avoid silently overwriting its changes.', 'elementor' ),
				implode( ', ', Widget_Context_Helper::V3_ALLOWLIST )
			),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results', 'post_id', 'edit_url' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
					'post_id' => [ 'type' => 'integer' ],
					'edit_url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Elementor editor URL for the document. Share with the user when they need a link (they must be logged into WordPress as an editor). To self-validate the render, call elementor/create-preview-link.',
					],
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
									'description' => 'update only: partial plain settings map merged onto existing settings. Set a top-level key to null to remove it from the element\'s settings (subject to widget schema validation).',
								],
								'style' => [
									'type' => 'string',
									'description' => 'update only: plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks (e.g. @media(--mobile)). Merged with existing local style variants. Use style_apply_mode to control merge behaviour.',
								],
								'style_apply_mode' => [
									'type' => 'string',
									'enum' => [ 'patch', 'replace' ],
									'default' => 'patch',
									'description' => 'patch (default): merge incoming style variants with existing. replace: discard existing variants for the affected breakpoints before writing new ones. Pass an empty string with replace to wipe all local style variants.',
								],
								'classes' => [
									'type' => 'array',
									'items' => [ 'type' => 'string' ],
									'description' => 'update only: global class labels to attach (prepended to existing). Pass an empty array [] to remove all global classes from the element (local styles are preserved).',
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
		$started_at = hrtime( true );
		$input      = is_array( $input ) ? $input : [];
		$post_id    = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;
		$operations = $input['operations'] ?? null;

		if ( empty( $input['post_id'] ) ) {
			$error = $this->bad_request( __( 'post_id is required.', 'elementor' ) );
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $error );
			return $error;
		}

		if ( ! is_array( $operations ) ) {
			$error = $this->bad_request( __( 'operations array is required.', 'elementor' ) );
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $error );
			return $error;
		}

		if ( empty( $operations ) ) {
			$error = $this->bad_request( __( 'operations must not be empty.', 'elementor' ) );
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $error );
			return $error;
		}

		if ( count( $operations ) > self::MAX_BATCH_SIZE ) {
			$error = new \WP_Error(
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
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $error, $operations );
			return $error;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			$error = new \WP_Error(
				'elementor_forbidden',
				__( 'You do not have permission to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $error, $operations );
			return $error;
		}

		$document = $this->resolve_document( $post_id );
		if ( is_wp_error( $document ) ) {
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, null, $document, $operations );
			return $document;
		}

		return $this->handle_bulk( $document, $operations, $started_at );
	}

	private function handle_bulk( Document $document, array $operations, int $started_at ): array {
		$results             = new Bulk_Operations_Result();
		$tree                = $this->get_tree( $document );
		$any_change          = false;
		$pending_events      = [];
		$all_warning_codes   = [];
		$class_attachments   = 0;
		$interactions_count  = 0;

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

			$outcome = $this->apply_operation( $document, $tree, $action, $element_id, $operation );

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

			$all_warning_codes  = array_merge( $all_warning_codes, $outcome['warning_codes'] ?? [] );
			$class_attachments  += count( $outcome['event_metadata']['applied_classes'] ?? [] );
			$interactions_count += count( $outcome['event_metadata']['interactions_events'] ?? [] );

			if ( ! empty( $outcome['event_metadata'] ) ) {
				$pending_events[] = [ 'action' => $action ] + $outcome['event_metadata'];
			}
		}

		$response            = $results->to_array();
		$response['post_id'] = (int) $document->get_main_id();
		$post_id             = (int) $document->get_main_id();

		if ( ! $any_change ) {
			$response = $this->with_edit_url( $response, $document );
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, $document, null, $operations, $response, $all_warning_codes, $class_attachments, $interactions_count );
			return $response;
		}

		$save_result = Document_Mutation_Save::elements_preserving_live_status( $this->get_mutator(), $document, $tree );
		if ( is_wp_error( $save_result ) ) {
			$response['status'] = 'error';
			$response['save_error'] = $save_result->get_error_message();
			$response = $this->with_edit_url( $response, $document );
			$this->emit_mcp_manage_elements_executed( $started_at, $post_id, $document, $save_result, $operations, $response, $all_warning_codes, 0, 0 );
			return $response;
		}

		Plugin::$instance->files_manager->clear_cache();

		$this->emit_update_events( $pending_events, $tree );

		$saved_post = $save_result->get_post();
		$response['version'] = $saved_post ? $saved_post->post_modified_gmt : current_time( 'mysql', true );
		$response = $this->with_edit_url( $response, $document );
		$this->emit_mcp_manage_elements_executed( $started_at, $post_id, $document, null, $operations, $response, $all_warning_codes, $class_attachments, $interactions_count );
		return $response;
	}

	private function with_edit_url( array $response, Document $document ): array {
		$response['edit_url'] = $document->get_edit_url();

		return $response;
	}

	private function apply_operation( Document $document, array $tree, string $action, string $element_id, array $operation ) {
		$v3_error = $this->reject_v3_target( $tree, $element_id );
		if ( $v3_error ) {
			return $v3_error;
		}

		switch ( $action ) {
			case 'update':
				return $this->apply_update( $document, $tree, $element_id, $operation );
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

	private function reject_v3_target( array $tree, string $element_id ): ?\WP_Error {
		$node = $this->get_mutator()->find_by_id( $tree, $element_id );
		if ( null === $node ) {
			return null;
		}

		$type = $node['widgetType'] ?? $node['elType'] ?? null;
		if ( ! is_string( $type ) || '' === $type ) {
			return null;
		}

		if ( Widget_Context_Helper::is_v3_allowlisted( $type ) ) {
			return null;
		}

		$instance = Atomic_Elements_Utils::get_element_instance( $type );
		if ( $instance && Atomic_Elements_Utils::is_atomic_element( $instance ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_v3_not_supported',
			__( 'Legacy V3 element cannot be modified through this MCP. Edit V3 elements directly in the Elementor editor.', 'elementor' ),
			[
				'status' => \WP_Http::BAD_REQUEST,
				'element_id' => $element_id,
				'version' => 'v3',
			]
		);
	}

	private function apply_delete( array $tree, string $element_id ) {
		$new_tree = $this->get_mutator()->remove( $tree, $element_id );
		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return [
			'tree' => $new_tree,
			'warnings' => [],
			'warning_codes' => [],
		];
	}

	private function apply_duplicate( array $tree, string $element_id ) {
		$source_node = $this->get_mutator()->find_by_id( $tree, $element_id );
		$new_tree = $this->get_mutator()->duplicate( $tree, $element_id );
		if ( is_wp_error( $new_tree ) ) {
			return $this->to_public_error( $new_tree );
		}

		return [
			'tree' => $new_tree,
			'warnings' => [],
			'warning_codes' => [],
			'event_metadata' => [
				'duplicated_element_types' => is_array( $source_node ) ? $this->collect_element_types( $source_node ) : [],
			],
		];
	}

	private function collect_element_types( array $node ): array {
		$types = [];
		$stack = [ $node ];

		while ( ! empty( $stack ) ) {
			$current = array_pop( $stack );
			$type    = $current['widgetType'] ?? $current['elType'] ?? '';

			if ( '' !== $type ) {
				$types[] = $type;
			}

			foreach ( $current['elements'] ?? [] as $child ) {
				$stack[] = $child;
			}
		}

		return $types;
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
			'warning_codes' => [],
		];
	}

	private function apply_update( Document $document, array $tree, string $element_id, array $operation ) {
		$settings = $this->as_map( $operation['settings'] ?? [] );
		$style = $operation['style'] ?? null;
		$has_style = isset( $operation['style'] );
		$has_classes = array_key_exists( 'classes', $operation );
		$classes = $has_classes ? $operation['classes'] : null;
		$interactions = $operation['interactions'] ?? null;

		$has_change = ! empty( $settings ) || $has_style || $has_classes || null !== $interactions;
		if ( ! $has_change ) {
			return new \WP_Error( 'invalid_input', __( 'update requires at least one of settings, style, classes, or interactions.', 'elementor' ) );
		}

		$style_apply_mode = $operation['style_apply_mode'] ?? 'patch';
		if ( ! in_array( $style_apply_mode, [ 'patch', 'replace' ], true ) ) {
			return new \WP_Error( 'invalid_input', __( 'style_apply_mode must be "patch" or "replace".', 'elementor' ) );
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

		$variables_service    = $this->create_variables_service();
		$warnings             = [];
		$warning_codes        = [];
		$applied_classes      = [];
		$variable_connections = [];
		$interactions_events  = [];

		if ( null !== $interactions ) {
			if ( ! is_array( $interactions ) ) {
				return new \WP_Error( 'invalid_input', __( 'interactions must be an array of interaction items.', 'elementor' ) );
			}
			if ( ! Plugin::$instance->experiments->is_feature_active( Interactions_Module::EXPERIMENT_NAME ) ) {
				return new \WP_Error(
					'elementor_invalid_interactions',
					__( 'Interactions experiment is not active. Interactions were not applied.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			$previous_items = $node_snapshot['interactions']['items'] ?? [];

			$interactions_applier = new Interactions_Applier( $this->get_plain_values_resolver() );
			$interactions_result = $interactions_applier->apply( $index, [ $element_id => $interactions ] );
			if ( $interactions_result['error'] ) {
				return $interactions_result['error'];
			}
			$warnings = array_merge( $warnings, $interactions_result['warnings'] );

			$interactions_events = $this->build_interactions_events( (string) $element_type, $previous_items, $interactions );
		}

		if ( ! empty( $settings ) ) {
			if ( Element_Config_Applier::COMPONENT_INSTANCE_WIDGET_TYPE === $element_type ) {
				$component_applier = new Component_Instance_Applier( new Components_Repository(), $this->get_plain_values_resolver() );
				$component_error = $component_applier->apply_partial( $index, [ $element_id => $settings ], $document );
				if ( $component_error ) {
					return $component_error;
				}
			} else {
				$config_applier = new Element_Config_Applier( $type_resolver, $this->get_plain_values_resolver() );
				$config_result = $config_applier->apply(
					$index,
					[ $element_id => $settings ],
					$widget_configs,
					$document
				);
				if ( $config_result['error'] ) {
					return $config_result['error'];
				}
				$warnings      = array_merge( $warnings, $config_result['warnings'] );
				$warning_codes = array_merge( $warning_codes, $config_result['warning_codes'] ?? [] );
			}
		}

		if ( $has_classes ) {
			if ( ! is_array( $classes ) ) {
				return new \WP_Error( 'invalid_input', __( 'classes must be an array of global class labels.', 'elementor' ) );
			}
			$class_applier = new Class_Applier( $this->create_global_classes_repository() );
			$class_error = $class_applier->apply( $index, [ $element_id => $classes ] );
			if ( $class_error ) {
				return $class_error;
			}
			$applied_classes = $classes;
		}

		if ( $has_style ) {
			$style_applier = new Style_Applier( $this->create_css_converter( $variables_service ), $this->get_active_breakpoints() );
			$style_result = $style_applier->apply( $index, [ $element_id => $style ], $style_apply_mode, $widget_configs );
			if ( $style_result['error'] ) {
				return $style_result['error'];
			}
			$warnings             = array_merge( $warnings, $style_result['warnings'] );
			$warning_codes        = array_merge( $warning_codes, $style_result['warning_codes'] ?? [] );
			$variable_connections = $style_result['variable_connections'][ $element_id ] ?? [];
		}

		return [
			'tree'           => $tree,
			'warnings'       => $warnings,
			'warning_codes'  => $warning_codes,
			'event_metadata' => [
				'element_id'           => $element_id,
				'element_type'         => (string) $element_type,
				'applied_classes'      => $applied_classes,
				'variable_connections' => $variable_connections,
				'interactions_events'  => $interactions_events,
			],
		];
	}

	protected function build_interactions_events( string $element_type, array $previous_items, array $new_items ): array {
		if ( [] === $new_items ) {
			return [
				[
					'event_name' => 'interactions_cleared',
					'payload'    => [
						'affected_element_type' => $element_type,
						'target_value'          => count( $previous_items ),
					],
				],
			];
		}

		$previous_by_id = [];
		foreach ( $previous_items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$id = $this->extract_interaction_id( $item );
			if ( null !== $id ) {
				$previous_by_id[ $id ] = true;
			}
		}

		$events = [];

		foreach ( $new_items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$id            = $item['interaction_id'] ?? '';
			$is_update     = is_string( $id ) && '' !== $id && isset( $previous_by_id[ $id ] );
			$event_name    = $is_update ? 'interaction_updated' : 'interaction_created';

			$events[] = [
				'event_name' => $event_name,
				'payload'    => [
					'affected_element_type' => $element_type,
					'interaction_trigger'   => $this->stringify_interaction_field( $item['trigger'] ?? '' ),
					'interaction_effect'    => $this->stringify_interaction_field( $item['animation'] ?? '' ),
				],
			];
		}

		return $events;
	}

	private function extract_interaction_id( array $item ): ?string {
		if ( isset( $item['interaction_id'] ) && is_string( $item['interaction_id'] ) && '' !== $item['interaction_id'] ) {
			return $item['interaction_id'];
		}

		$nested = $item['value']['interaction_id']['value'] ?? $item['interaction_id']['value'] ?? null;

		if ( is_string( $nested ) && '' !== $nested ) {
			return $nested;
		}

		return null;
	}

	private function stringify_interaction_field( $value ): string {
		if ( is_string( $value ) ) {
			return $value;
		}

		if ( is_array( $value ) ) {
			if ( isset( $value['effect'] ) && is_string( $value['effect'] ) ) {
				return $value['effect'];
			}

			$nested_effect = $value['value']['effect']['value'] ?? $value['effect']['value'] ?? null;
			if ( is_string( $nested_effect ) && '' !== $nested_effect ) {
				return $nested_effect;
			}

			if ( isset( $value['value'] ) && ( is_string( $value['value'] ) || is_numeric( $value['value'] ) ) ) {
				return (string) $value['value'];
			}
			if ( isset( $value['$$type'] ) && is_string( $value['$$type'] ) ) {
				return (string) $value['$$type'];
			}
		}

		return '';
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

	private function get_active_breakpoints(): array {
		return array_keys( Plugin::$instance->breakpoints->get_active_breakpoints() );
	}

	private function emit_update_events( array $pending_events, array $tree ): void {
		if ( empty( $pending_events ) ) {
			return;
		}

		$all_labels   = $this->create_global_classes_repository()->all_labels();
		$class_counts = $this->count_class_usage_in_tree( $tree );

		foreach ( $pending_events as $meta ) {
			$action = $meta['action'] ?? '';

			if ( 'duplicate' === $action ) {
				foreach ( $meta['duplicated_element_types'] ?? [] as $element_name ) {
					Mcp_Event_Dispatcher::emit( 'element_added', [
						'element_name' => $element_name,
					] );
				}
				continue;
			}

			$element_type = $meta['element_type'] ?? '';

			foreach ( $meta['applied_classes'] ?? [] as $label ) {
				$class_id = array_search( $label, $all_labels, true );

				if ( false === $class_id ) {
					continue;
				}

				Mcp_Event_Dispatcher::emit( 'class_applied', [
					'target_name'                 => 'apply_class',
					'id'                          => (string) $class_id,
					'name'                        => $label,
					'affected_element_type'       => $element_type,
					'total_instances_after_apply' => $class_counts[ $class_id ] ?? 0,
				] );
			}

			foreach ( $meta['variable_connections'] as $connection ) {
				Mcp_Event_Dispatcher::emit( 'variable_connected', [
					'id'           => $connection['variable_id'],
					'var_type'     => $connection['var_type'],
					'control_path' => $connection['control_path'],
				] );
			}

			foreach ( $meta['interactions_events'] ?? [] as $ie ) {
				Mcp_Event_Dispatcher::emit( $ie['event_name'], $ie['payload'] );
			}
		}
	}

	private function count_class_usage_in_tree( array $tree ): array {
		$counts = [];
		$this->walk_tree_for_class_counts( $tree, $counts );
		return $counts;
	}

	private function walk_tree_for_class_counts( array $elements, array &$counts ): void {
		foreach ( $elements as $element ) {
			$class_values = $element['settings']['classes']['value'] ?? [];

			if ( is_array( $class_values ) ) {
				foreach ( $class_values as $class_id ) {
					if ( is_string( $class_id ) && ! str_starts_with( $class_id, Style_Applier::LOCAL_STYLE_ID_PREFIX ) ) {
						$counts[ $class_id ] = ( $counts[ $class_id ] ?? 0 ) + 1;
					}
				}
			}

			if ( ! empty( $element['elements'] ) ) {
				$this->walk_tree_for_class_counts( $element['elements'], $counts );
			}
		}
	}

	private function emit_mcp_manage_elements_executed(
		int $started_at,
		int $post_id,
		?Document $document = null,
		?\WP_Error $top_level_error = null,
		array $operations = [],
		array $response = [],
		array $warning_codes = [],
		int $class_attachments = 0,
		int $interactions_count = 0
	): void {
		$duration_ms = Tool_Performance_Metrics::duration_ms_since( $started_at );

		[ 'status' => $status, 'error_code' => $error_code ] = Tool_Performance_Metrics::resolve_status( $response, $top_level_error );

		$failed_results = array_filter( $response['results'] ?? [], fn( $r ) => 'error' === ( $r['status'] ?? '' ) );
		$failed_count   = count( $failed_results );
		$failed_codes   = array_values( array_unique( array_column( $failed_results, 'code' ) ) );

		$ops_count  = count( $operations );
		$by_action  = [];
		foreach ( $operations as $op ) {
			$action = $op['action'] ?? '';
			if ( is_string( $action ) && '' !== $action ) {
				$by_action[ $action ] = ( $by_action[ $action ] ?? 0 ) + 1;
			}
		}

		$dominant_action = '';
		if ( ! empty( $by_action ) ) {
			arsort( $by_action );
			$dominant_action = (string) array_key_first( $by_action );
		}

		$payload = [
			'tool_name'                  => $this->get_ability_id(),
			'status'                     => $status,
			'duration_ms'                => $duration_ms,
			'post_id'                    => $post_id,
			'action'                     => $dominant_action,
			'operations_count'           => $ops_count,
			'operations_by_type'         => $by_action,
			'failed_operations_count'    => $failed_count,
			'failed_operation_codes'     => $failed_codes,
			'class_attachments_count'    => $class_attachments,
			'interactions_applied_count' => $interactions_count,
			'warning_count'              => count( array_unique( $warning_codes ) ),
			'warning_types'              => array_values( array_unique( $warning_codes ) ),
		];

		if ( null !== $document ) {
			$payload['document_type'] = $document->get_name();
		}

		if ( null !== $error_code ) {
			$payload['error_code'] = $error_code;
		}

		Mcp_Event_Dispatcher::emit( 'mcp_manage_elements_executed', $payload );
	}
}
