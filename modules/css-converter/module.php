<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\CssConverter\Routes\VariablesRoute;
use Elementor\Modules\CssConverter\Routes\Classes_Route;

class Module extends BaseModule {
	private $variables_route;
	private $classes_route;

	public function get_name() {
		return 'css-converter';
	}

	public function __construct( $variables_route = null, $classes_route = null ) {
		parent::__construct();
		$this->variables_route = $variables_route;
		$this->classes_route = $classes_route;
		// Only initialize routes in non-test environments
		if ( ! $this->is_test_environment() && ! $variables_route && ! $classes_route ) {
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

	private function init_routes(): void {
		try {
			$this->variables_route = new VariablesRoute();
			$this->classes_route = new Classes_Route();
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
