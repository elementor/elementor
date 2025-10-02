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
		$widgets_route_file = __DIR__ . '/routes/widgets-route.php';
		
		if ( ! file_exists( $widgets_route_file ) ) {
			$this->handle_widgets_route_missing();
			return;
		}
		
		require_once $widgets_route_file;
		
		if ( class_exists( '\Elementor\Modules\CssConverter\Routes\Widgets_Route' ) ) {
			$this->widgets_route = new \Elementor\Modules\CssConverter\Routes\Widgets_Route();
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
}
