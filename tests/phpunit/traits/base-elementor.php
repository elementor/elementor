<?php
namespace Elementor\Testing\Traits;

use Elementor\Plugin;
use Elementor\Testing\Factories\Factory;

trait Base_Elementor {

	/**
	 * @var Plugin
	 */
	private static $elementor;

	/**
	 * @var Factory
	 */
	private static $factory;

	/**
	 * @param $name
	 *
	 * @return Plugin|Factory
	 */
	public function __get( $name ) {
		switch ( $name ) {
			case 'factory':
				return self::factory();
			case 'elementor':
				return self::elementor();
		}
	}

	/**
	 * Extends the wordpress factory.
	 *
	 * @return Factory
	 */
	protected static function factory() {
		if ( ! self::$factory ) {
			self::$factory = new Factory();
		}

		return self::$factory;
	}

	/**
	 * @return Plugin
	 */
	protected static function elementor() {
		if ( ! self::$elementor ) {
			self::$elementor = Plugin::instance();
		}

		return self::$elementor;
	}
}
