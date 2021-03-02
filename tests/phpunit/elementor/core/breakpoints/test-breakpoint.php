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
		$breakpoint = $this->create_breakpoint();

		$this->assertEquals( 'test', $breakpoint->get_name() );
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
		$this->set_admin_user();

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		// Set a custom value for the tablet breakpoint.
		$kit->set_settings( 'viewport_tablet', 900 );

		// Save kit settings.
		$kit->save( [ 'settings' => $kit->get_settings() ] );

		// Refresh kit.
		$kit = Plugin::$instance->documents->get( $kit->get_id(), false );

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

	private function set_admin_user() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		// In the production environment 'JS' sends empty array, do the same.
		add_post_meta( $kit->get_main_id(), '_elementor_data', '[]' );
	}
}
