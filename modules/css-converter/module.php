<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

class Module extends BaseModule {
	private $variables_route;
	private $classes_route;
	private $widgets_route;
	public function get_name() {
		return 'css-converter';
	}
	public function __construct( $variables_route = null, $classes_route = null, $widgets_route = null ) {
		parent::__construct();
		$this->variables_route = $variables_route;
		$this->classes_route = $classes_route;
		$this->widgets_route = $widgets_route;
		// Reset property mapper registry to ensure fresh instances
		$this->reset_property_mapper_registry();
		// Only initialize routes in non-test environments
		if ( ! $this->is_test_environment() && ! $variables_route && ! $classes_route && ! $widgets_route ) {
			$this->init_routes();
		}

		// Add global hooks for CSS converter base styles override
		add_action( 'wp_head', [ $this, 'maybe_inject_base_styles_override' ], 999 );
		add_action( 'elementor/editor/wp_head', [ $this, 'maybe_inject_base_styles_override' ], 999 );
		add_action( 'elementor/preview/enqueue_styles', [ $this, 'maybe_inject_base_styles_override' ], 999 );

		// Add editor load debug
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'debug_editor_widget_loading' ], 5 );
	}
	private function is_test_environment(): bool {
		return defined( 'WP_TESTS_DOMAIN' ) ||
				defined( 'PHPUNIT_COMPOSER_INSTALL' ) ||
				isset( $_ENV['PHPUNIT_RUNNING'] ) ||
				( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() && $this->is_phpunit_ajax_request() );
	}
	private function is_phpunit_ajax_request(): bool {
		return $this->has_phpunit_action_in_post();
	}
	private function has_phpunit_action_in_post(): bool {
		return isset( $_POST['action'] ) && 'phpunit' === $_POST['action'];
	}
	private function reset_property_mapper_registry(): void {
		\Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory::reset();
	}
	private function init_routes(): void {
		if ( ! $this->can_initialize_routes() ) {
			$this->handle_initialization_failure();
			return;
		}
		$this->load_required_dependencies();
		$this->skip_global_styles_service_initialization_due_to_kit_meta_storage();
		$this->initialize_global_classes_override();
		$this->initialize_classes_route();
		$this->initialize_variables_route();
		$this->initialize_atomic_widgets_route();
	}
	private function can_initialize_routes(): bool {
		return function_exists( 'error_log' ) && $this->has_required_directories();
	}
	private function has_required_directories(): bool {
		$required_dirs = [ 'exceptions', 'parsers', 'convertors', 'services', 'routes' ];
		foreach ( $required_dirs as $dir ) {
			if ( ! is_dir( __DIR__ . '/' . $dir ) ) {
				return false;
			}
		}
		return true;
	}
	private function load_required_dependencies(): void {
		$required_files = $this->get_required_files();
		foreach ( $required_files as $file ) {
			$this->load_file_if_exists( $file );
		}
	}
	private function get_required_files(): array {
		return [
			'/exceptions/class-conversion-exception.php',
			'/exceptions/css-parse-exception.php',
			'/parsers/css-parser.php',
			'/parsers/parsed-css.php',
			'/convertors/css-properties/css-property-convertor-config.php',
			'/convertors/css-properties/contracts/property-mapper-interface.php',
			'/convertors/css-properties/implementations/property-mapper-base.php',
			'/convertors/css-properties/implementations/class-property-mapper-registry.php',
			'/convertors/css-properties/implementations/class-property-mapper-factory.php',
			'/services/css/validation/request-validator.php',
			'/services/css/parsing/html-parser.php',
			'/services/css/processing/css-specificity-calculator.php',
			'/services/css/processing/css-property-conversion-service.php',
			'/services/css/processing/css-processor.php',
			'/services/widgets/widget-mapper.php',
			'/services/global-classes/class-conversion-service.php',
			'/services/variables/variable-conversion-service.php',
			'/convertors/variables/variable_convertor_interface.php',
			'/convertors/variables/convertors/abstract_variable_convertor.php',
			'/convertors/variables/convertors/color_hex_variable_convertor.php',
			'/convertors/variables/convertors/color_rgb_variable_convertor.php',
			'/convertors/variables/convertors/color_rgba_variable_convertor.php',
			'/convertors/variables/convertors/length_size_viewport_variable_convertor.php',
			'/convertors/variables/convertors/percentage_variable_convertor.php',
			'/convertors/variables/variable_convertor_registry.php',
		];
	}
	private function load_file_if_exists( string $file ): void {
		$file_path = __DIR__ . $file;
		if ( file_exists( $file_path ) ) {
			require_once $file_path;
		}
	}
	private function skip_global_styles_service_initialization_due_to_kit_meta_storage(): void {
		// Intentionally empty - CSS_Converter_Global_Styles service was removed
		// Global classes are now stored directly in Kit meta via Global_Classes_Repository
	}
	private function initialize_global_classes_override(): void {
		$override_service_file = __DIR__ . '/services/styles/css-converter-global-classes-override.php';
		if ( ! file_exists( $override_service_file ) ) {
			return;
		}
		require_once $override_service_file;
		if ( class_exists( '\Elementor\Modules\CssConverter\Services\Styles\CSS_Converter_Global_Classes_Override' ) ) {
			$override_service = \Elementor\Modules\CssConverter\Services\Styles\CSS_Converter_Global_Classes_Override::make();
			$override_service->register_hooks();
		}
	}
	private function initialize_classes_route(): void {
		$classes_route_file = __DIR__ . '/routes/classes-route.php';
		if ( ! file_exists( $classes_route_file ) ) {
			$this->handle_classes_route_missing();
			return;
		}
		require_once $classes_route_file;
		if ( class_exists( '\Elementor\Modules\CssConverter\Routes\Classes_Route' ) ) {
			$this->classes_route = new \Elementor\Modules\CssConverter\Routes\Classes_Route();
		}
	}
	private function initialize_variables_route(): void {
		$variables_route_file = __DIR__ . '/routes/variables-route.php';
		if ( ! file_exists( $variables_route_file ) ) {
			$this->handle_variables_route_missing();
			return;
		}
		require_once $variables_route_file;
		if ( class_exists( '\Elementor\Modules\CssConverter\Routes\Variables_Route' ) ) {
			$this->variables_route = new \Elementor\Modules\CssConverter\Routes\Variables_Route();
		}
	}

	private function initialize_atomic_widgets_route(): void {
		$atomic_widgets_route_file = __DIR__ . '/routes/atomic-widgets-route.php';
		if ( ! file_exists( $atomic_widgets_route_file ) ) {
			return;
		}
		require_once $atomic_widgets_route_file;
		if ( class_exists( '\Elementor\Modules\CssConverter\Routes\Atomic_Widgets_Route' ) ) {
			new \Elementor\Modules\CssConverter\Routes\Atomic_Widgets_Route();
		}
	}
	private function handle_initialization_failure(): void {
	}
	private function handle_classes_route_missing(): void {
	}
	private function handle_variables_route_missing(): void {
	}
	public function get_variables_route() {
		return $this->variables_route;
	}
	public function set_variables_route( $variables_route ): void {
		$this->variables_route = $variables_route;
	}
	public function get_classes_route() {
		return $this->classes_route;
	}
	public function set_classes_route( $classes_route ): void {
		$this->classes_route = $classes_route;
	}

	public function maybe_inject_base_styles_override() {
		// This method is no longer used - we're implementing base class renaming instead of CSS injection
		// Keeping the method for backward compatibility but it does nothing
		return;
	}

	private function page_has_css_converter_widgets( int $post_id ): bool {
		$document = \Elementor\Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			return false;
		}
		$elements_data = $document->get_elements_data();
		return $this->traverse_elements_for_css_converter_widgets( $elements_data );
	}
	private function traverse_elements_for_css_converter_widgets( array $elements_data ): bool {
		foreach ( $elements_data as $element_data ) {
			// Check if this element has CSS converter flag
			if ( isset( $element_data['editor_settings']['css_converter_widget'] ) && $element_data['editor_settings']['css_converter_widget'] ) {
				return true;
			}
			// Recursively check child elements
			if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				if ( $this->traverse_elements_for_css_converter_widgets( $element_data['elements'] ) ) {
					return true;
				}
			}
		}
		return false;
	}

	public function debug_editor_widget_loading() {

		$post_id = get_the_ID();

		if ( ! $post_id ) {
			return;
		}

		// Check post data
		$elementor_data = get_post_meta( $post_id, '_elementor_data', true );
		if ( ! $elementor_data ) {
			return;
		}

		$data = is_string( $elementor_data ) ? json_decode( $elementor_data, true ) : $elementor_data;
		if ( ! $data || ! is_array( $data ) ) {
			return;
		}

		// Find widget types in data
		$widget_types = [];
		array_walk_recursive( $data, function( $value, $key ) use ( &$widget_types ) {
			if ( $key === 'widgetType' ) {
				$widget_types[] = $value;
			}
		} );

		$unique_types = array_unique( $widget_types );

		// Check for converted widgets
		$converted_types = array_filter( $unique_types, function( $type ) {
			return strpos( $type, '-converted' ) !== false;
		} );

		if ( ! empty( $converted_types ) ) {

			// Verify if they're registered
			foreach ( $converted_types as $type ) {
				$widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
				if ( $widget ) {
				} else {
				}
			}
		} else {
		}
	}
}
