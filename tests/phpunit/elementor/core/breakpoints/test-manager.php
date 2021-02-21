<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Breakpoints;

use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	/**
	 * Test Get Name
	 *
	 * Test the Breakpoints_Manager::get_name() method.
	 *
	 * @since 3.2.0
	 */
	public function test_get_name() {
		$this->assertEquals( 'breakpoints', Plugin::$instance->breakpoints->get_name() );
	}

	/**
	 * Test Get Breakpoints
	 *
	 * Test the Breakpoints_Manager::get_breakpoints() method.
	 *
	 * @since 3.2.0
	 */
	public function test_get_breakpoints() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$all_breakpoint_names = array_keys( Breakpoints_Manager::get_default_config() );

		$this->assertIsArray( $breakpoints );

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			// Check that the items in the breakpoints array are actual breakpoints.
			$this->assertTrue( $breakpoint instanceof Breakpoint );

			// Check that the generated breakpoint is one of the breakpoints in the default config array.
			$this->assertContains( $breakpoint_name, $all_breakpoint_names );
		}
	}

	/**
	 * Test Get Config
	 *
	 * Test the Breakpoints_Manager::get_config() method.
	 *
	 * @since 3.2.0
	 */
	public function test_get_config() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$active_config = Plugin::$instance->breakpoints->get_active_config();

		// Create an array and populate it with the keys of only enabled breakpoints.
		$enabled_breakpoint_keys = [];

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			if ( $breakpoint->is_enabled() ) {
				$enabled_breakpoint_keys[] = $breakpoint->get_name();

				// This checks both that the config item is an array and that it contains the correct keys.
				$this->assertArrayHaveKeys( [ 'value', 'direction', 'is_enabled' ], $active_config[ $breakpoint_name ] );
			}
		}

		$this->assertEquals( $enabled_breakpoint_keys, array_keys( $active_config ) );
	}

	/**
	 * Test Has Custom Breakpoints
	 *
	 * Test the Breakpoints_Manager::has_custom_breakpoints() method.
	 *
	 * @since 3.2.0
	 */
	public function test_has_custom_breakpoints() {
		$config = Plugin::$instance->breakpoints->get_active_config();
		$breakpoints_default_config = Breakpoints_Manager::get_default_config();

		$has_custom_breakpoints = false;

		foreach ( $config as $breakpoint_name => $breakpoint ) {
			if ( $breakpoints_default_config[ $breakpoint_name ]['default_value'] !== $breakpoint['value'] ) {
				$has_custom_breakpoints = true;
				break;
			}
		}

		$this->assertEquals( $has_custom_breakpoints, Plugin::$instance->breakpoints->has_custom_breakpoints() );
	}

	/**
	 * Test Get Device Min Breakpoint
	 *
	 * Test the Breakpoints_Manager::get_device_min_breakpoint() method.
	 * This test only tests the default breakpoints (mobile, tablet).
	 *
	 * @since 3.2.0
	 */
	public function test_get_device_min_breakpoint() {
		$config = Plugin::$instance->breakpoints->get_active_config();

		// Test for mobile specifically, which always has a min point of 0.
		$this->assertEquals( 0, Plugin::$instance->breakpoints->get_device_min_breakpoint( Breakpoints_Manager::BREAKPOINT_KEY_MOBILE ) );

		$this->assertEquals( $config[ Breakpoints_Manager::BREAKPOINT_KEY_MOBILE ]['value'] + 1, Plugin::$instance->breakpoints->get_device_min_breakpoint( Breakpoints_Manager::BREAKPOINT_KEY_TABLET, true ) );
	}
}
