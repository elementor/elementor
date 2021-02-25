<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Breakpoints;

use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Testing\Traits\Extra_Assertions;

class Test_Breakpoint extends Elementor_Test_Base {

	use Extra_Assertions;

	/**
	 * Test Get Name
	 *
	 * Tests Breakpoint::get_name() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_name() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$this->assertEquals( $breakpoint_name, $breakpoint->get_name() );
		}
	}

	/**
	 * Test Get Config
	 *
	 * Tests Breakpoint::get_config() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_config() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();

		foreach ( $breakpoints as $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$breakpoint_config = $breakpoint->get_config();

			$this->assertArrayHaveKeys( [ 'value', 'direction', 'is_enabled' ], $breakpoint_config );
			$this->assertTrue( is_numeric( $breakpoint_config['value'] ) );
			$this->assertTrue( is_string( $breakpoint_config['direction'] ) );
			$this->assertTrue( is_bool( $breakpoint_config['is_enabled'] ) );
		}
	}

	/**
	 * Test Is Enabled
	 *
	 * Tests Breakpoint::get_config() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_is_enabled() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		/** @var Breakpoint[] $active_breakpoint_names */
		$active_breakpoint_names = array_keys( Plugin::$instance->breakpoints->get_active_breakpoints() );

		foreach ( $breakpoints as $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			if ( $breakpoint->is_enabled() ) {
				// Check if the enabled breakpoint is in the array of active breakpoint names, as returned from the
				// Breakpoints Manager's `get_config()` method.
				$this->assertContains( $breakpoint->get_name(), $active_breakpoint_names );
			} else {
				$this->assertNotContains( $breakpoint->get_name(), $active_breakpoint_names );
			}
		}
	}

	/**
	 * Test Get Value
	 *
	 * Tests Breakpoint::get_value() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_value() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$breakpoints_default_config = Breakpoints_Manager::get_default_config();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$value_from_db = Plugin::$instance->kits_manager->get_current_settings( Breakpoints_Manager::BREAKPOINT_OPTION_PREFIX . $breakpoint_name );

			if ( $value_from_db ) {
				$this->assertEquals( $value_from_db, $breakpoint->get_value() );
			} else {
				$this->assertEquals( $breakpoints_default_config[ $breakpoint_name ]['default_value'], $breakpoint->get_value() );
			}
		}
	}

	/**
	 * Test Is Custom
	 *
	 * Tests Breakpoint::is_custom() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_is_custom() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$breakpoints_default_config = Breakpoints_Manager::get_default_config();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$value = $breakpoint->get_value();
			$default_value = $breakpoints_default_config[ $breakpoint_name ]['default_value'];

			$this->assertEquals( $value !== $default_value, $breakpoint->is_custom(), $breakpoint_name );
		}
	}

	/**
	 * Test Get Default Value
	 *
	 * Tests Breakpoint::get_default_value() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_default_value() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$breakpoints_default_config = Breakpoints_Manager::get_default_config();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$this->assertEquals( $breakpoints_default_config[ $breakpoint_name ]['default_value'], $breakpoint->get_default_value() );
		}
	}

	/**
	 * Test Get Direction
	 *
	 * Tests Breakpoint::get_direction() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_direction() {
		$breakpoints = Plugin::$instance->breakpoints->get_breakpoints();
		$breakpoints_default_config = Breakpoints_Manager::get_default_config();

		foreach ( $breakpoints as $breakpoint_name => $breakpoint ) {
			/** @var Breakpoint $breakpoint */
			$this->assertEquals( $breakpoints_default_config[ $breakpoint_name ]['direction'], $breakpoint->get_direction() );
		}
	}
}
