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
			__( 'Manage V4 global CSS classes on the active kit. Create, update, or delete a single class using raw CSS declarations.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'class' => [ 'type' => 'object' ],
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
				'required' => [ 'action' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => [ 'create', 'update', 'delete' ],
					],
					'id' => [
						'type' => 'string',
						'description' => 'Class id — required for update/delete.',
					],
					'label' => [
						'type' => 'string',
						'description' => 'Class label (lowercase, dash-separated) — required for create/update.',
					],
					'css' => [
						'type' => 'object',
						'description' => 'Raw CSS declarations (property → value) — required for create/update.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$action = $input['action'] ?? '';

		switch ( $action ) {
			case 'create':
				return $this->handle_create( $input );
			case 'update':
				return $this->handle_update( $input );
			case 'delete':
				return $this->handle_delete( $input );
			default:
				return $this->bad_request( sprintf(
					/* translators: %s: action name */
					__( 'Unknown action: %s.', 'elementor' ),
					$action
				) );
		}
	}

	private function handle_create( array $input ) {
		$label = $input['label'] ?? '';
		$css = $this->as_map( $input['css'] ?? [] );

		if ( '' === $label || empty( $css ) ) {
			return $this->bad_request( __( 'Create requires label and css.', 'elementor' ) );
		}

		$duplicate_error = $this->assert_label_available( $label );
		if ( $duplicate_error ) {
			return $duplicate_error;
		}

		$class_item = $this->build_class_item( $this->generate_class_id(), $label, $css );
		if ( is_wp_error( $class_item ) ) {
			return $class_item;
		}

		$class_id = $class_item['id'];
		$order = $this->get_repository()->get_order();
		$new_order = array_merge( $order, [ $class_id ] );

		$this->get_repository()->apply_changes(
			[ $class_id => $class_item ],
			[
				'added' => [ $class_id ],
				'deleted' => [],
				'modified' => [],
				'order' => count( $new_order ) !== count( $order ),
			],
			$new_order
		);

		$this->clear_cache();

		return $this->ok( $class_item, $new_order );
	}

	private function handle_update( array $input ) {
		$id = $input['id'] ?? '';
		$label = $input['label'] ?? '';
		$css = $this->as_map( $input['css'] ?? [] );

		if ( '' === $id || '' === $label || empty( $css ) ) {
			return $this->bad_request( __( 'Update requires id, label, and css.', 'elementor' ) );
		}

		$existing = $this->get_repository()->get( $id );
		if ( ! $existing ) {
			return $this->not_found( __( 'Global class not found', 'elementor' ) );
		}

		$duplicate_error = $this->assert_label_available( $label, $id );
		if ( $duplicate_error ) {
			return $duplicate_error;
		}

		$class_item = $this->build_class_item( $id, $label, $css );
		if ( is_wp_error( $class_item ) ) {
			return $class_item;
		}

		$order = $this->get_repository()->get_order();

		$this->get_repository()->apply_changes(
			[ $id => $class_item ],
			[
				'added' => [],
				'deleted' => [],
				'modified' => [ $id ],
				'order' => false,
			],
			$order
		);

		$this->clear_cache();

		return $this->ok( $class_item, $order );
	}

	private function handle_delete( array $input ) {
		$id = $input['id'] ?? '';

		if ( '' === $id ) {
			return $this->bad_request( __( 'Delete requires id.', 'elementor' ) );
		}

		$order = $this->get_repository()->get_order();
		if ( ! in_array( $id, $order, true ) ) {
			return $this->not_found( __( 'Global class not found', 'elementor' ) );
		}

		$existing = $this->get_repository()->get( $id );
		if ( ! $existing ) {
			return $this->not_found( __( 'Global class not found', 'elementor' ) );
		}

		$new_order = array_values( array_filter( $order, fn( $class_id ) => $class_id !== $id ) );

		$this->get_repository()->apply_changes(
			[],
			[
				'added' => [],
				'deleted' => [ $id ],
				'modified' => [],
				'order' => count( $new_order ) !== count( $order ),
			],
			$new_order
		);

		$this->clear_cache();

		return $this->ok( $existing, $new_order );
	}

	private function build_class_item( string $id, string $label, array $css ) {
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

	private function generate_class_id(): string {
		return Utils::generate_id( 'g-', array_keys( $this->get_repository()->all_labels() ) );
	}

	private function assert_label_available( string $label, ?string $except_id = null ): ?\WP_Error {
		foreach ( $this->get_repository()->all_labels() as $id => $existing_label ) {
			if ( null !== $except_id && $id === $except_id ) {
				continue;
			}

			if ( $existing_label === $label ) {
				return new \WP_Error(
					'duplicated_label',
					__( 'Global class label already exists', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		return null;
	}

	private function ok( array $class, array $order ): array {
		return [
			'status' => 'ok',
			'class' => $class,
			'order' => $order,
		];
	}

	private function not_found( string $message ): \WP_Error {
		return new \WP_Error( 'class_not_found', $message, [ 'status' => \WP_Http::NOT_FOUND ] );
	}

	private function bad_request( string $message ): \WP_Error {
		return new \WP_Error( 'invalid_input', $message, [ 'status' => \WP_Http::BAD_REQUEST ] );
	}

	private function clear_cache(): void {
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
