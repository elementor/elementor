<?php
namespace Elementor\Core\Router;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager extends BaseModule {

	public function get_name() {
		return 'router';
	}

	public function get_current_location() {
		$params = [
			'get' => [],
			'post' => [],
		];

		foreach ( [ 'get' => $_GET, 'post' => $_POST ] as $params_name => $params_value ) {// phpcs:ignore -- nonce validation is not require here.
			foreach ( $params_value as $key => $value ) {
				$params[ $params_name ][ $key ] = $value;
			}
		}

		$params = [
			'get' => new Collection( $params['get'] ),
			'post' => new Collection( $params['post'] ),
		];

		return [
			'file' => basename( $_SERVER['SCRIPT_NAME'] ),
			'params' => $params,
		];
	}

	public function add_route( Route_Base $route ) {
		add_action( $route->get_wp_action(), function () use ( $route ) {
			$this->base_callback( $route, func_get_args() );
		} );
	}

	private function base_callback( Route_Base $route, $args ) {
		if ( $route->get_conditions( $this->get_current_location(), $args ) ) {
			$route->apply();
		}
	}
}
