<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Classes_Ability extends Abstract_Ability {

	const CLASS_TYPE = 'class';
	const DESKTOP_BREAKPOINT = 'desktop';
	const MAX_BATCH_SIZE = 50;

	private ?Global_Classes_Repository $repository;
	private ?Css_Converter $css_converter;

	public function __construct( ?Global_Classes_Repository $repository = null, ?Css_Converter $css_converter = null ) {
		$this->repository = $repository;
		$this->css_converter = $css_converter;
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-classes';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Global Classes', 'elementor' ),
			__( 'Manage V4 global CSS classes on the active kit. Bulk create, update, or delete using raw CSS declarations (up to 50 operations).', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results', 'order' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
					'order' => [
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
			fn() => current_user_can( Add_Capabilities::UPDATE_CLASS ),
			[
				'type' => 'object',
				'required' => [ 'operations' ],
				'properties' => [
					'operations' => [
						'type' => 'array',
						'description' => 'Bulk operations (1–50). Each item requires action; create/update need label and css, update/delete need id.',
						'items' => [
							'type' => 'object',
							'required' => [ 'action' ],
							'properties' => [
								'action' => [
									'type' => 'string',
									'enum' => [ 'create', 'update', 'delete' ],
								],
								'id' => [ 'type' => 'string' ],
								'label' => [ 'type' => 'string' ],
								'css' => [
									'type' => 'object',
									'description' => 'Raw CSS declarations (property → value).',
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

		return $this->handle_bulk( $operations );
	}

	private function handle_bulk( array $operations ): array {
		$labels = $this->get_repository()->all_labels();
		$original_order = $this->get_repository()->get_order();
		$order = $original_order;
		$existing_items = [];
		$touched_items = [];
		$added = [];
		$modified = [];
		$deleted = [];
		$deleted_set = [];
		$pending_labels = [];
		$results_by_index = [];
		$reserved_ids = array_keys( $labels );

		foreach ( $operations as $index => $operation ) {
			if ( ! is_array( $operation ) ) {
				$results_by_index[ $index ] = $this->operation_error(
					$index,
					'',
					'invalid_input',
					__( 'Invalid operation.', 'elementor' )
				);
				continue;
			}

			$action = $operation['action'] ?? '';

			switch ( $action ) {
				case 'create':
					$this->apply_create_operation(
						$index,
						$operation,
						$labels,
						$order,
						$touched_items,
						$added,
						$deleted_set,
						$pending_labels,
						$reserved_ids,
						$results_by_index
					);
					break;
				case 'update':
					$this->apply_update_operation(
						$index,
						$operation,
						$labels,
						$order,
						$existing_items,
						$touched_items,
						$modified,
						$deleted_set,
						$pending_labels,
						$results_by_index
					);
					break;
				case 'delete':
					$this->apply_delete_operation(
						$index,
						$operation,
						$labels,
						$order,
						$deleted,
						$deleted_set,
						$pending_labels,
						$results_by_index
					);
					break;
				default:
					$results_by_index[ $index ] = $this->operation_error(
						$index,
						$action,
						'invalid_input',
						sprintf(
							/* translators: %s: action name */
							__( 'Unknown action: %s.', 'elementor' ),
							$action
						)
					);
			}
		}

		if ( ! empty( $added ) || ! empty( $modified ) || ! empty( $deleted ) ) {
			$this->get_repository()->apply_changes(
				$touched_items,
				[
					'added' => $added,
					'deleted' => $deleted,
					'modified' => $modified,
					'order' => $order !== $original_order,
				],
				$order
			);

			$this->clear_cache();
		}

		return $this->build_response( $results_by_index, $order );
	}

	private function apply_create_operation(
		int $index,
		array $operation,
		array &$labels,
		array &$order,
		array &$touched_items,
		array &$added,
		array $deleted_set,
		array &$pending_labels,
		array &$reserved_ids,
		array &$results_by_index
	): void {
		$label = $operation['label'] ?? '';
		$css = $this->as_map( $operation['css'] ?? [] );

		if ( '' === $label || empty( $css ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'create',
				'invalid_input',
				__( 'Create requires label and css.', 'elementor' )
			);

			return;
		}

		if ( $this->is_label_taken( $label, $labels, $pending_labels ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'create',
				'duplicated_label',
				__( 'Global class label already exists', 'elementor' )
			);

			return;
		}

		$active_count = $this->count_active_classes( $order, $deleted_set );

		if ( $active_count >= Global_Classes_REST_API::MAX_ITEMS ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'create',
				'global_classes_limit_exceeded',
				sprintf(
					/* translators: %d: Maximum allowed items. */
					__( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
					Global_Classes_REST_API::MAX_ITEMS
				)
			);

			return;
		}

		$class_id = Utils::generate_id( 'g-', $reserved_ids );
		$reserved_ids[] = $class_id;

		$class_item = $this->build_class_item( $class_id, $label, $css );

		if ( is_wp_error( $class_item ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'create',
				$class_item->get_error_code(),
				$class_item->get_error_message()
			);

			return;
		}

		$labels[ $class_id ] = $label;
		$pending_labels[ $label ] = $class_id;
		$touched_items[ $class_id ] = $class_item;
		$added[] = $class_id;
		$order[] = $class_id;

		$results_by_index[ $index ] = [
			'index' => $index,
			'action' => 'create',
			'status' => 'ok',
			'id' => $class_id,
			'label' => $label,
		];
	}

	private function apply_update_operation(
		int $index,
		array $operation,
		array &$labels,
		array $order,
		array &$existing_items,
		array &$touched_items,
		array &$modified,
		array $deleted_set,
		array &$pending_labels,
		array &$results_by_index
	): void {
		$id = $operation['id'] ?? '';
		$label = $operation['label'] ?? '';
		$css = $this->as_map( $operation['css'] ?? [] );

		if ( '' === $id || '' === $label || empty( $css ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'update',
				'invalid_input',
				__( 'Update requires id, label, and css.', 'elementor' )
			);

			return;
		}

		if ( ! in_array( $id, $order, true ) || isset( $deleted_set[ $id ] ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'update',
				'class_not_found',
				__( 'Global class not found', 'elementor' )
			);

			return;
		}

		if ( $this->is_label_taken( $label, $labels, $pending_labels, $id ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'update',
				'duplicated_label',
				__( 'Global class label already exists', 'elementor' )
			);

			return;
		}

		if ( ! isset( $existing_items[ $id ] ) ) {
			$existing_items[ $id ] = $this->get_repository()->get( $id );
		}

		if ( ! $existing_items[ $id ] ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'update',
				'class_not_found',
				__( 'Global class not found', 'elementor' )
			);

			return;
		}

		$class_item = $this->build_class_item( $id, $label, $css );

		if ( is_wp_error( $class_item ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'update',
				$class_item->get_error_code(),
				$class_item->get_error_message()
			);

			return;
		}

		$labels[ $id ] = $label;
		$pending_labels[ $label ] = $id;
		$touched_items[ $id ] = $class_item;

		if ( ! in_array( $id, $modified, true ) ) {
			$modified[] = $id;
		}

		$results_by_index[ $index ] = [
			'index' => $index,
			'action' => 'update',
			'status' => 'ok',
			'id' => $id,
			'label' => $label,
		];
	}

	private function apply_delete_operation(
		int $index,
		array $operation,
		array &$labels,
		array &$order,
		array &$deleted,
		array &$deleted_set,
		array &$pending_labels,
		array &$results_by_index
	): void {
		$id = $operation['id'] ?? '';

		if ( '' === $id ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'delete',
				'invalid_input',
				__( 'Delete requires id.', 'elementor' )
			);

			return;
		}

		if ( ! in_array( $id, $order, true ) || isset( $deleted_set[ $id ] ) ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'delete',
				'class_not_found',
				__( 'Global class not found', 'elementor' )
			);

			return;
		}

		$existing = $this->get_repository()->get( $id );

		if ( ! $existing ) {
			$results_by_index[ $index ] = $this->operation_error(
				$index,
				'delete',
				'class_not_found',
				__( 'Global class not found', 'elementor' )
			);

			return;
		}

		$label = $labels[ $id ] ?? ( $existing['label'] ?? '' );
		$deleted[] = $id;
		$deleted_set[ $id ] = true;
		$order = array_values( array_filter( $order, fn( $class_id ) => $class_id !== $id ) );
		unset( $labels[ $id ] );

		if ( '' !== $label ) {
			unset( $pending_labels[ $label ] );
		}

		$results_by_index[ $index ] = [
			'index' => $index,
			'action' => 'delete',
			'status' => 'ok',
			'id' => $id,
			'label' => $label,
		];
	}

	private function count_active_classes( array $order, array $deleted_set ): int {
		$count = 0;

		foreach ( $order as $class_id ) {
			if ( ! isset( $deleted_set[ $class_id ] ) ) {
				$count++;
			}
		}

		return $count;
	}

	private function is_label_taken( string $label, array $labels, array $pending_labels, ?string $except_id = null ): bool {
		foreach ( $labels as $id => $existing_label ) {
			if ( null !== $except_id && $id === $except_id ) {
				continue;
			}

			if ( $existing_label === $label ) {
				return true;
			}
		}

		foreach ( $pending_labels as $pending_label => $pending_id ) {
			if ( null !== $except_id && $pending_id === $except_id ) {
				continue;
			}

			if ( $pending_label === $label ) {
				return true;
			}
		}

		return false;
	}

	protected function build_class_item( string $id, string $label, array $css ) {
		$variant = $this->convert_css_to_variant( $css );
		if ( is_wp_error( $variant ) ) {
			return $variant;
		}

		$definition = [
			'id' => $id,
			'label' => $label,
			'type' => self::CLASS_TYPE,
			'variants' => [ $variant ],
		];

		$parse_result = Style_Parser::make( Style_Schema::get() )->parse( $definition );
		if ( ! $parse_result->is_valid() ) {
			return new \WP_Error(
				'invalid_class',
				$parse_result->errors()->to_string(),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $parse_result->unwrap();
	}

	private function convert_css_to_variant( array $css ) {
		$css_parts = [];
		foreach ( $css as $property => $value ) {
			$is_null_reset = null === $value || 'null' === $value;
			$css_parts[] = $property . ': ' . ( $is_null_reset ? 'null' : $value ) . ';';
		}

		$result = $this->get_css_converter()->convert( implode( ' ', $css_parts ) );

		if ( ! empty( $result['rejected'] ) ) {
			return new \WP_Error(
				'invalid_css',
				sprintf(
					/* translators: %s: comma-separated rejected variable references */
					__( 'Invalid variable usage: %s. Variables must exist in elementor://global-variables and use label-only references.', 'elementor' ),
					implode( ', ', $result['rejected'] )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( empty( $result['props'] ) && empty( $result['customCss'] ) ) {
			return new \WP_Error(
				'invalid_css',
				__( 'CSS produced no valid style properties.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$custom_css = $result['customCss'] ?? '';

		return [
			'meta' => [
				'breakpoint' => self::DESKTOP_BREAKPOINT,
				'state' => null,
			],
			'props' => $result['props'] ?? [],
			'custom_css' => '' !== $custom_css
				? [ 'raw' => base64_encode( $custom_css ) ] // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Global class custom_css.raw is stored as base64.
				: null,
		];
	}

	private function build_response( array $results_by_index, array $order ): array {
		ksort( $results_by_index );

		$results = array_values( $results_by_index );
		$ok_count = 0;
		$error_count = 0;

		foreach ( $results as $result ) {
			if ( 'ok' === ( $result['status'] ?? '' ) ) {
				$ok_count++;
			} else {
				$error_count++;
			}
		}

		$status = 'ok';
		if ( $ok_count > 0 && $error_count > 0 ) {
			$status = 'partial_error';
		} elseif ( 0 === $ok_count ) {
			$status = 'error';
		}

		return [
			'status' => $status,
			'results' => $results,
			'order' => $order,
		];
	}

	private function operation_error( int $index, string $action, string $code, string $message ): array {
		return [
			'index' => $index,
			'action' => $action,
			'status' => 'error',
			'code' => $code,
			'message' => $message,
		];
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function clear_cache(): void {
		if ( ! class_exists( Plugin::class ) || ! isset( Plugin::$instance ) ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
	}

	private function get_repository(): Global_Classes_Repository {
		if ( $this->repository ) {
			return $this->repository;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}

	private function get_css_converter(): Css_Converter {
		if ( $this->css_converter ) {
			return $this->css_converter;
		}

		$variables_service = $this->create_variables_service();

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

	private function as_map( $value ): array {
		if ( is_object( $value ) ) {
			$value = (array) $value;
		}

		return is_array( $value ) ? $value : [];
	}
}
