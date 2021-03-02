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
		$breakpoint = $this->create_breakpoint();
		$breakpoint_config = $breakpoint->get_config();

		$this->assertArrayHaveKeys( [ 'value', 'direction', 'is_enabled', 'label' ], $breakpoint_config );
		$this->assertTrue( is_int( $breakpoint_config['value'] ) );
		$this->assertTrue( is_string( $breakpoint_config['direction'] ) );
		$this->assertTrue( is_bool( $breakpoint_config['is_enabled'] ) );
	}

	/**
	 * Test Is Enabled
	 *
	 * Tests Breakpoint::get_config() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_is_enabled() {
		$breakpoint = $this->create_breakpoint();

		$this->assertTrue( $breakpoint->is_enabled() );
	}

	/**
	 * Test Get Value
	 *
	 * Tests Breakpoint::get_value() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_value() {
		$breakpoint = $this->create_breakpoint();

		$this->assertEquals( 800, $breakpoint->get_value() );
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
		$breakpoint = $this->create_breakpoint();

		$this->assertEquals( 800, $breakpoint->get_default_value() );
	}

	/**
	 * Test Get Direction
	 *
	 * Tests Breakpoint::get_direction() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_direction() {
		$breakpoint = $this->create_breakpoint();

		$this->assertEquals( 'max', $breakpoint->get_direction() );
	}

	/**
	 * Create Breakpoint
	 *
	 * Creates and returns a test breakpoint.
	 *
	 * @since 3.2.0
	 *
	 * @return Breakpoint
	 */
	private function create_breakpoint() {
		return new Breakpoint( [
			'name' => 'test',
			'label' => 'Test',
			'direction' => 'max',
			'is_enabled' => true,
			'default_value' => 800,
		] );
	}
}
