<?php

namespace Elementor;

use Exception;
use DI\ContainerBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Container.
 *
 * Elementor container handler class is responsible for containerization
 * manager classes and their dependencies.
 *
 * @since 1.0.0
 */

class Container extends ContainerBuilder {

	protected static $instance;

	public function __construct()
	{
		parent::__construct();
		$this->registerConfiguration();
	}

	private function registerConfiguration()
	{
		$this->addDefinitions( __DIR__ . '/config.php');
	}

	/**
	 * @throws Exception
	 */
	public function init(): \DI\Container
	{
		return $this->build();
	}

	public static function getInstance()
	{
		if (is_null(static::$instance)) {
			static::$instance = new static;

			static::$instance->init();
		}

		return static::$instance;
	}

	public static function setInstance()
	{
		static::$instance = new static;

		static::$instance->init();

		return static::$instance;
	}
}


