<?php

namespace Elementor\Container;

use ElementorDeps\DI\ContainerBuilder;
use ElementorDeps\DI\Container as DIContainer;

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

	private static function initialize(): DIContainer {
		if ( isset( self::$instance ) ) {
			return self::$instance;
		}

		$builder = new ContainerBuilder();

		self::register_configuration( $builder );
		return $builder->build();
	}

	private static function register_configuration( ContainerBuilder $builder ) {
		$builder->addDefinitions( __DIR__ . '/config.php' );
	}

	public static function initialize_instance() {
		static::$instance = self::initialize();
	}

	public static function get_instance() {
		if ( is_null( static::$instance ) ) {
			self::initialize_instance();
		}

		return static::$instance;
	}
}
