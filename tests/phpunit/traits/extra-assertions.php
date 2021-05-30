<?php
namespace Elementor\Testing\Traits;

/**
 * @mixin \WP_UnitTestCase
 */
trait Extra_Assertions {
	/**
	 * Asserts that an array have the specified keys.
	 *
	 * @param array $keys
	 * @param array|\ArrayAccess $array
	 * @param string $message
	 */
	public function assertArrayHaveKeys( $keys, $array, $message = '' ) {
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
	 * @param $keys
	 * @param $array
	 * @param string $message
	 */
	public function assertArrayNotHaveKeys( $keys, $array, $message = '' ) {
		if ( ! is_array( $keys ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only array'
			);
		}

		foreach ( $keys as $key ) {
			$this->assertArrayNotHasKey( $key, $array, $message );
		}
	}

	/**
	 * assert that an action has been registered for this hook.
	 *
	 * @param string $tag
	 * @param false|callable $function_to_check
	 */
	public function assertHasHook( $tag, $function_to_check = false ) {
		if ( ! is_string( $tag ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only string'
			);
		}

		if ( ! ( is_callable( $function_to_check ) || ( ! $function_to_check ) ) ) {
			throw \PHPUnit_Util_InvalidArgumentHelper::factory(
				1,
				'only callback of false'
			);
		}

		$this->assertNotFalse( has_filter( $tag, $function_to_check ) );
	}

	/**
	 * In case the _doing_it_wrong with the $doing_it_wrong not called, the test will be failed.
	 *
	 * @param $doing_it_wrong
	 */
	public function expectDoingItWrong( $doing_it_wrong ) {
		$this->setExpectedIncorrectUsage($doing_it_wrong);

		// Just to make sure phpunit not mark the test as risky
		$this->assertTrue(true);
	}
}
