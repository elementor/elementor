<?php

namespace Elementor\Container;

use Exception;
use ElementorDep\DI\ContainerBuilder;
use ElementorDep\DI\Container as DIContainer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Container.
 *
 * Elementor container handler class is responsible for containerization
 * manager classes and their dependencies.
 *
 * @since 3.24.0
 */

class Container extends ContainerBuilder {

	protected static $instance;

	public function __construct() {
		parent::__construct();
		$this->register_configuration();
	}

	private function register_configuration() {
		$this->addDefinitions( __DIR__ . '/config.php' );
	}

	/**
	 * @throws Exception
	 */
	public function init(): DIContainer {
		return $this->build();
	}

	/**
	 * @throws Exception
	 */
	public static function get_instance() {
		if ( is_null( static::$instance ) ) {
			$instance = new static();

			static::$instance = $instance->init();
		}

		return static::$instance;
	}

	/**
	 * @throws Exception
	 */
	public static function set_instance() {
		$instance = new static();

		static::$instance = $instance->init();

		return static::$instance;
	}
}


