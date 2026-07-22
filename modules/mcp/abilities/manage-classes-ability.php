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
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\Mcp\Abilities\Utils\Bulk_Operations_Result;
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
			__( 'Manage V4 global CSS classes on the active kit. Bulk create, update, or delete using raw CSS declarations (up to 50 operations). Duplicate labels are auto-renamed with a DUP_ prefix.', 'elementor' ),
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
		$results = new Bulk_Operations_Result();
		$repo = $this->get_repository();
		$all_labels = $repo->all_labels();
		$current_order = $repo->get_order();

		$intents = $this->translate_operations( $operations, $all_labels, $current_order, $results );

		$touched_items = $this->build_touched_items( $intents, $all_labels, $results );

		$this->handle_duplicated_labels( $intents, $touched_items, $all_labels, $results );

		$this->enforce_max_items( $intents, $touched_items, $all_labels, $results );

		$added_ids = array_values( array_intersect( $intents['added_ids'], array_keys( $touched_items ) ) );
		$modified_ids = array_values( array_intersect( $intents['modified_ids'], array_keys( $touched_items ) ) );
		$deleted_ids = $intents['deleted_ids'];

		$new_order = $this->compute_new_order( $current_order, $added_ids, $deleted_ids );

		if ( ! empty( $added_ids ) || ! empty( $modified_ids ) || ! empty( $deleted_ids ) ) {
			$repo->apply_changes(
				$touched_items,
				[
					'added' => $added_ids,
					'deleted' => $deleted_ids,
					'modified' => $modified_ids,
					'order' => $new_order !== $current_order,
				],
				$new_order
			);

			$this->clear_cache();
		}

		return $results->to_array() + [ 'order' => $new_order ];
	}

	private function translate_operations( array $operations, array $all_labels, array $current_order, Bulk_Operations_Result $results ): array {
		$intents = [
			'creates' => [],
			'updates' => [],
			'deletes' => [],
			'added_ids' => [],
			'modified_ids' => [],
			'deleted_ids' => [],
		];

		$reserved_ids = array_keys( $all_labels );
		$deleted_set = [];

		foreach ( $operations as $index => $operation ) {
			if ( ! is_array( $operation ) ) {
				$results->add_error( $index, '', 'invalid_input', __( 'Invalid operation.', 'elementor' ) );
				continue;
			}

			$action = $operation['action'] ?? '';

			switch ( $action ) {
				case 'create':
					$this->translate_create( $index, $operation, $intents, $reserved_ids, $results );
					break;

				case 'update':
					$this->translate_update( $index, $operation, $intents, $all_labels, $current_order, $deleted_set, $results );
					break;

				case 'delete':
					$this->translate_delete( $index, $operation, $intents, $all_labels, $current_order, $deleted_set, $results );
					break;

				default:
					$results->add_error(
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

		return $intents;
	}

	private function translate_create( int $index, array $operation, array &$intents, array &$reserved_ids, Bulk_Operations_Result $results ): void {
		$label = $operation['label'] ?? '';
		$css = $this->as_map( $operation['css'] ?? [] );

		if ( '' === $label || empty( $css ) ) {
			$results->add_error( $index, 'create', 'invalid_input', __( 'Create requires label and css.', 'elementor' ) );
			return;
		}

		$class_id = Utils::generate_id( 'g-', $reserved_ids );
		$reserved_ids[] = $class_id;

		$intents['creates'][ $index ] = [
			'id' => $class_id,
			'label' => $label,
			'css' => $css,
		];
		$intents['added_ids'][] = $class_id;
	}

	private function translate_update( int $index, array $operation, array &$intents, array $all_labels, array $current_order, array $deleted_set, Bulk_Operations_Result $results ): void {
		$id = $operation['id'] ?? '';
		$label = $operation['label'] ?? '';
		$css = $this->as_map( $operation['css'] ?? [] );

		if ( '' === $id || '' === $label || empty( $css ) ) {
			$results->add_error( $index, 'update', 'invalid_input', __( 'Update requires id, label, and css.', 'elementor' ) );
			return;
		}

		if ( ! in_array( $id, $current_order, true ) || isset( $deleted_set[ $id ] ) ) {
			$results->add_error( $index, 'update', 'class_not_found', __( 'Global class not found', 'elementor' ) );
			return;
		}

		$existing = $this->get_repository()->get( $id );
		if ( ! $existing ) {
			$results->add_error( $index, 'update', 'class_not_found', __( 'Global class not found', 'elementor' ) );
			return;
		}

		$intents['updates'][ $index ] = [
			'id' => $id,
			'label' => $label,
			'css' => $css,
		];

		if ( ! in_array( $id, $intents['modified_ids'], true ) ) {
			$intents['modified_ids'][] = $id;
		}
	}

	private function translate_delete( int $index, array $operation, array &$intents, array $all_labels, array $current_order, array &$deleted_set, Bulk_Operations_Result $results ): void {
		$id = $operation['id'] ?? '';

		if ( '' === $id ) {
			$results->add_error( $index, 'delete', 'invalid_input', __( 'Delete requires id.', 'elementor' ) );
			return;
		}

		if ( ! in_array( $id, $current_order, true ) || isset( $deleted_set[ $id ] ) ) {
			$results->add_error( $index, 'delete', 'class_not_found', __( 'Global class not found', 'elementor' ) );
			return;
		}

		$existing = $this->get_repository()->get( $id );
		if ( ! $existing ) {
			$results->add_error( $index, 'delete', 'class_not_found', __( 'Global class not found', 'elementor' ) );
			return;
		}

		$label = $all_labels[ $id ] ?? ( $existing['label'] ?? '' );
		$deleted_set[ $id ] = true;

		$intents['deletes'][ $index ] = [
			'id' => $id,
			'label' => $label,
		];
		$intents['deleted_ids'][] = $id;

		$results->add_success( $index, 'delete', [
			'id' => $id,
			'label' => $label,
		] );
	}

	private function build_touched_items( array $intents, array $all_labels, Bulk_Operations_Result $results ): array {
		$touched_items = [];

		foreach ( $intents['creates'] as $index => $intent ) {
			$class_item = $this->build_class_item( $intent['id'], $intent['label'], $intent['css'] );

			if ( is_wp_error( $class_item ) ) {
				$results->add_error( $index, 'create', $class_item->get_error_code(), $class_item->get_error_message() );
				continue;
			}

			$touched_items[ $intent['id'] ] = $class_item;
		}

		foreach ( $intents['updates'] as $index => $intent ) {
			$class_item = $this->build_class_item( $intent['id'], $intent['label'], $intent['css'] );

			if ( is_wp_error( $class_item ) ) {
				$results->add_error( $index, 'update', $class_item->get_error_code(), $class_item->get_error_message() );
				continue;
			}

			$touched_items[ $intent['id'] ] = $class_item;
		}

		return $touched_items;
	}

	private function handle_duplicated_labels( array $intents, array &$touched_items, array $all_labels, Bulk_Operations_Result $results ): void {
		$deleted_ids = $intents['deleted_ids'];
		$existing_labels = [];

		foreach ( $all_labels as $id => $label ) {
			if ( ! in_array( $id, $deleted_ids, true ) ) {
				$existing_labels[] = $label;
			}
		}

		$pending_labels = [];

		foreach ( $intents['creates'] as $index => $intent ) {
			if ( ! isset( $touched_items[ $intent['id'] ] ) ) {
				continue;
			}

			$label = $intent['label'];
			$is_duplicate = in_array( $label, $existing_labels, true ) || in_array( $label, $pending_labels, true );

			if ( $is_duplicate ) {
				$all_existing = array_merge( $existing_labels, $pending_labels );
				$new_label = Global_Classes_Labels::generate_unique_label( $label, $all_existing );

				$touched_items[ $intent['id'] ]['label'] = $new_label;
				$pending_labels[] = $new_label;

				$results->add_success( $index, 'create', [
					'id' => $intent['id'],
					'label' => $new_label,
					'modified_label' => [
						'original' => $label,
						'modified' => $new_label,
					],
				] );
			} else {
				$pending_labels[] = $label;
				$results->add_success( $index, 'create', [
					'id' => $intent['id'],
					'label' => $label,
				] );
			}
		}

		foreach ( $intents['updates'] as $index => $intent ) {
			if ( ! isset( $touched_items[ $intent['id'] ] ) ) {
				continue;
			}

			$label = $intent['label'];
			$current_label = $all_labels[ $intent['id'] ] ?? '';

			$is_duplicate = false;
			if ( $label !== $current_label ) {
				$is_duplicate = in_array( $label, $existing_labels, true ) || in_array( $label, $pending_labels, true );
			}

			if ( $is_duplicate ) {
				$all_existing = array_merge( $existing_labels, $pending_labels );
				$new_label = Global_Classes_Labels::generate_unique_label( $label, $all_existing );

				$touched_items[ $intent['id'] ]['label'] = $new_label;
				$pending_labels[] = $new_label;

				$results->add_success( $index, 'update', [
					'id' => $intent['id'],
					'label' => $new_label,
					'modified_label' => [
						'original' => $label,
						'modified' => $new_label,
					],
				] );
			} else {
				if ( $label !== $current_label ) {
					$pending_labels[] = $label;
				}
				$results->add_success( $index, 'update', [
					'id' => $intent['id'],
					'label' => $label,
				] );
			}
		}
	}

	private function enforce_max_items( array $intents, array &$touched_items, array $all_labels, Bulk_Operations_Result $results ): void {
		$deleted_count = count( $intents['deleted_ids'] );
		$existing_count = count( $all_labels ) - $deleted_count;
		$added_count = count( array_intersect( $intents['added_ids'], array_keys( $touched_items ) ) );

		$total_count = $existing_count + $added_count;

		if ( $total_count <= Global_Classes_REST_API::MAX_ITEMS ) {
			return;
		}

		$overflow = $total_count - Global_Classes_REST_API::MAX_ITEMS;
		$error_message = sprintf(
			/* translators: %d: Maximum allowed items. */
			__( 'Global classes limit exceeded. Maximum allowed: %d', 'elementor' ),
			Global_Classes_REST_API::MAX_ITEMS
		);

		$creates_to_reject = array_slice( $intents['creates'], -$overflow, $overflow, true );

		foreach ( $creates_to_reject as $index => $intent ) {
			if ( isset( $touched_items[ $intent['id'] ] ) ) {
				unset( $touched_items[ $intent['id'] ] );

				$results->add_error( $index, 'create', 'global_classes_limit_exceeded', $error_message );
			}
		}
	}

	private function compute_new_order( array $current_order, array $added_ids, array $deleted_ids ): array {
		$new_order = array_filter( $current_order, fn( $id ) => ! in_array( $id, $deleted_ids, true ) );
		$new_order = array_values( $new_order );

		return array_merge( $new_order, $added_ids );
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
