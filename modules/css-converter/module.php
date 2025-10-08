<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Module as BaseModule;

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
		
		// Add global hook for CSS converter base styles override
		add_action( 'wp_head', [ $this, 'maybe_inject_base_styles_override' ], 999 );
		
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
		$this->initialize_widgets_route();
		$this->initialize_classes_route();
		$this->initialize_variables_route();
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
			'/services/widgets/widget-creator.php',
			'/services/widgets/widget-conversion-service.php',
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

	private function initialize_widgets_route(): void {
		error_log( "🚨 LEVEL 1 DEBUG: Initializing widgets route" );
		$widgets_route_file = __DIR__ . '/routes/widgets-route.php';
		
		if ( ! file_exists( $widgets_route_file ) ) {
			error_log( "🚨 LEVEL 1 DEBUG: Widgets route file missing" );
			$this->handle_widgets_route_missing();
			return;
		}
		
		require_once $widgets_route_file;
		
		if ( class_exists( '\Elementor\Modules\CssConverter\Routes\Widgets_Route' ) ) {
			error_log( "🚨 LEVEL 1 DEBUG: Creating Widgets_Route instance" );
			$this->widgets_route = new \Elementor\Modules\CssConverter\Routes\Widgets_Route();
			error_log( "🚨 LEVEL 1 DEBUG: Widgets_Route instance created successfully" );
		} else {
			error_log( "🚨 LEVEL 1 DEBUG: Widgets_Route class not found" );
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

	private function handle_initialization_failure(): void {
		error_log( 'CSS Converter module: Cannot initialize - missing required directories or functions' );
	}

	private function handle_widgets_route_missing(): void {
		error_log( 'CSS Converter module: Widgets route file not found' );
	}

	private function handle_classes_route_missing(): void {
		error_log( 'CSS Converter module: Classes route file not found' );
	}

	private function handle_variables_route_missing(): void {
		error_log( 'CSS Converter module: Variables route file not found' );
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
		error_log( "🔥 MODULE: maybe_inject_base_styles_override called" );
		
		// Check if CSS converter zero defaults is active
		$zero_defaults_active = get_option( 'elementor_css_converter_zero_defaults_active', false );
		if ( ! $zero_defaults_active ) {
			error_log( "🔥 MODULE: CSS converter zero defaults not active, skipping" );
			return;
		}
		
		error_log( "🔥 MODULE: CSS converter zero defaults is active, checking for widgets" );
		
		// Get current post ID
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			error_log( "🔥 MODULE: No post ID found, skipping CSS override" );
			return;
		}
		
		error_log( "🔥 MODULE: Checking post " . $post_id . " for CSS converter widgets" );
		
		// Check if this page has CSS converter widgets
		if ( ! $this->page_has_css_converter_widgets( $post_id ) ) {
			error_log( "🔥 MODULE: No CSS converter widgets found, skipping CSS override" );
			return;
		}
		
		error_log( "🔥 MODULE: CSS converter widgets found, injecting override CSS" );
		
		// Inject CSS to override atomic widget base styles
		echo '<style id="css-converter-module-base-styles-override">';
		echo '/* CSS Converter Module: Override atomic widget base styles */';
		echo 'body .elementor .elementor-widget .e-paragraph { margin-top: 16px !important; margin-bottom: 16px !important; }';
		echo 'body .elementor .elementor-widget .e-heading { margin-top: 21px !important; margin-bottom: 21px !important; }';
		echo 'body .elementor .elementor-widget .e-paragraph p { margin-top: 16px !important; margin-bottom: 16px !important; }';
		echo 'body .elementor .elementor-widget .e-heading h1, body .elementor .elementor-widget .e-heading h2 { margin-top: 21px !important; margin-bottom: 21px !important; }';
		echo '</style>';
		
		error_log( "🔥 MODULE: CSS override injected successfully" );
		
		// Clear the flag after use to avoid affecting other pages
		delete_option( 'elementor_css_converter_zero_defaults_active' );
		error_log( "🔥 MODULE: Cleared CSS converter zero defaults flag" );
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
				error_log( "🔥 MODULE: Found CSS converter widget: " . ( $element_data['widgetType'] ?? 'unknown' ) );
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

}
