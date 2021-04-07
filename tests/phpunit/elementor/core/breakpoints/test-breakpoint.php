<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Breakpoints;

use Elementor\Core\Breakpoints\Breakpoint;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Testing\Traits\Breakpoints_Trait;
use Elementor\Testing\Traits\Extra_Assertions;

class Test_Breakpoint extends Elementor_Test_Base {

	use Extra_Assertions;
	use Breakpoints_Trait;

	/**
	 * Test Get Name
	 *
	 * Tests Breakpoint::get_name() for all breakpoints.
	 *
	 * @since 3.2.0
	 */
	public function test_get_name() {
		$breakpoint = $this->create_breakpoint();

		$this->assertEquals( 'test', $breakpoint->get_name() );
	}

	/**
	 * Test Is Enabled
	 *
	 * Tests Breakpoint::get_config().
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
		$this->set_custom_breakpoint_and_refresh_kit_and_breakpoints( 900 );

		$tablet_breakpoint = Plugin::$instance->breakpoints->get_breakpoints( 'tablet' );

		$this->assertTrue( $tablet_breakpoint->is_custom() );
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
