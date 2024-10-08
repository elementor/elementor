<?php

namespace Elementor\Container;

use ElementorDeps\DI\ContainerBuilder;
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
 * @since 3.25.0
 */

class Container {

	private static $instance;

	private function __construct() {}

	private function __clone() {}

	/**
	 * @throws Exception
	 */
	private static function initialize(): void {
		$builder = new ContainerBuilder();

		self::register_configuration( $builder );

		self::$instance = $builder->build();
	}

	private static function register_configuration( ContainerBuilder $builder ): void {
		$builder->addDefinitions( __DIR__ . '/config.php' );
	}

	/**
	 * @throws Exception
	 */
	public static function get_instance() {
		if ( is_null( static::$instance ) ) {
			self::initialize();
		}

		return static::$instance;
	}
}
