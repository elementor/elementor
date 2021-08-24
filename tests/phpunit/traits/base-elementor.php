<?php
namespace Elementor\Testing\Traits;

use Elementor\Plugin;
use Elementor\Core\Wp_Api;
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

	/**
	 * @param array $methods
	 *
	 * @return \PHPUnit\Framework\MockObject\MockObject
	 */
	protected function mock_wp_api( array $methods = [] ) {
		$mock = $this->getMockBuilder( Wp_Api::class )
			->setMethods( array_keys( $methods ) )
			->getMock();

		foreach ( $methods as $method_name => $method_return ) {
			$mock->method($method_name)
			     ->willReturn( $method_return );
		}

		Plugin::$instance->wp = $mock;

		return $mock;
	}
}
