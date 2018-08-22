<?php
namespace Elementor\Testing;

use Elementor\Plugin;

class Elementor_Test_Base extends \WP_UnitTestCase {
	/**
	 * @var Local_Factory
	 */
	private static $local_factory;
	private static $elementor;

	public function __get( $name ) {
		switch ( $name ) {
			case 'factory':
				return self::factory();
				break;
			case 'elementor':
				return self::elementor();
				break;
		}
	}

	/**
	 * @return \Elementor\Testing\Local_Factory|\WP_UnitTest_Factory
	 */
	protected static function factory() {
		if ( ! self::$local_factory ) {
			self::$local_factory = Manager::$instance->get_local_factory();
		}

		return self::$local_factory;
	}

	/**
	 * @return \Elementor\Plugin
	 */
	protected static function elementor() {
		if ( ! self::$elementor ) {
			self::$elementor = Plugin::$instance;
		}

		return self::$elementor;
	}

	/**
	 * Asserts that an array have the specified keys.
	 *
	 * @param array $keys
	 * @param array|\ArrayAccess $array
	 * @param string $message
	 */
	protected function assertArrayHaveKeys( $keys, $array, $message = '' ) {
		if ( ! is_array( $keys ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only array'
			);
		}

		foreach ( $keys as $key ) {
			$this->assertArrayHasKey( $key, $array, $message );
		}
	}

	/**
	 * assert that an action has been registered for this hook.
	 *
	 * @param string $tag
	 * @param false|callable $function_to_check
	 */
	protected function assertHasHook( $tag, $function_to_check = false ) {
		if ( ! is_string( $tag ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only string'
			);
		}

		if ( ! ( is_callable( $function_to_check ) ||  ( ! $function_to_check )) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only callback of false'
			);
		}

		$this->assertNotFalse( has_filter( $tag, $function_to_check ) );
	}
}
