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
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- This is for test environment detection only
		return isset( $_POST['action'] ) && 'phpunit' === $_POST['action'];
	}

	private function reset_property_mapper_registry(): void {
		// Reset the property mapper registry to ensure fresh instances with latest code
		if ( class_exists( 'Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory' ) ) {
			\Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory::reset();
		}
	}

	private function init_routes(): void {
		try {
			// Load ALL required dependencies to avoid cascading errors
			$required_files = [
				'/exceptions/class_conversion_exception.php',
				'/exceptions/css_parse_exception.php',
				'/parsers/css-parser.php',
				'/parsers/parsed-css.php',
				'/convertors/css-properties/css_property_convertor_config.php',
				'/convertors/css-properties/contracts/property_mapper_interface.php',
				'/convertors/css-properties/implementations/property_mapper_base.php',
				'/convertors/css-properties/implementations/class_property_mapper_registry.php',
				'/convertors/css-properties/implementations/class_property_mapper_factory.php',
				'/services/css/validation/request_validator.php',
				'/services/css/parsing/html_parser.php',
				'/services/css/processing/css_specificity_calculator.php',
				'/services/css/processing/css_property_conversion_service.php',
				'/services/css/processing/css_processor.php',
				'/services/widgets/widget-mapper.php',
				'/services/widgets/widget-creator.php',
				'/services/widgets/widget-conversion-service.php',
			];
			
			foreach ($required_files as $file) {
				$file_path = __DIR__ . $file;
				if (file_exists($file_path)) {
					require_once $file_path;
				}
			}
			
			// Only load the widgets route for now to avoid namespace issues
			require_once __DIR__ . '/routes/widgets_route.php';
			$this->widgets_route = new \Elementor\Modules\CssConverter\Routes\Widgets_Route();
			
			// TODO: Fix and re-enable other routes
			// require_once __DIR__ . '/routes/variables_route.php';
			// $this->variables_route = new \Elementor\Modules\CssConverter\Routes\Variables_Route();
			// 
			// require_once __DIR__ . '/routes/classes_route.php';
			// $this->classes_route = new \Elementor\Modules\CssConverter\Routes\Classes_Route();
		} catch ( \Throwable $e ) {
			// Log error in production but don't break the site
			if ( function_exists( 'error_log' ) ) {
				error_log( 'CSS Converter module failed to initialize: ' . $e->getMessage() );
			}

			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ){
				throw $e;
			}
		}
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
