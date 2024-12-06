<?php

namespace Elementor\Container;

use ElementorDeps\DI\Container as DIContainer;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Container.
 *
 * Elementor container handler class is responsible for the containerization
 * of manager classes and their dependencies.
 *
 * @since 3.24.0
 */

class Container {

	protected static $instance;

	private function __construct() {}

	private function __clone() {}

	/**
	 * @throws Exception
	 */
	public function create_container(): DIContainer {
		$builder = new Container_Builder();

		switch ( $this->is_hidden_experiment_active() ) {
			case true:
				$builder->with_experiment_configurations();
				break;
			case false:
				$builder->with_configurations();
				break;
		}

		return $builder->build();
	}

	private function is_hidden_experiment_active(): bool {
		return defined( 'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS' ) && ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS;
	}

	private function initialize(): void {
		if ( ! isset( self::$instance ) ) {
			self::$instance = $this->create_container();
		}
	}

	public static function get_instance() {
		if ( is_null( static::$instance ) ) {
			( new Container )->initialize();
		}

		return static::$instance;
	}
}
