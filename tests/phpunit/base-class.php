<?php

namespace Elementor\Testing;

class Elementor_Test_Base extends \WP_UnitTestCase {
	/**
	 * @var Local_Factory
	 */
	private static $local_factory;

	public function __get( $name ) {
		if ( 'local_factory' === $name ) {
			return self::local_factory();
		}

		return parent::__get( $name );
	}

	protected static function local_factory() {
		if ( ! self::$local_factory ) {
			self::$local_factory = Manager::$instance->get_local_factory();
		}

		return self::$local_factory;
	}

	/**
	 * Asserts that an array have specified keys.
	 *
	 * @param array $keys
	 * @param array|\ArrayAccess $array
	 * @param string $message
	 */
	protected function assertArrayHaveKeys( $keys, $array, $message ) {
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
}