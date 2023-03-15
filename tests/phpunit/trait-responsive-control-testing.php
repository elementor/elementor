<?php
namespace Elementor\Tests\Phpunit;

use Elementor\Plugin;

trait Responsive_Control_Testing_Trait {

	/**
	 * Arrange
	 *
	 * The test case here is checking that the method works properly for CSS Generation, which requires
	 * responsive control duplication in the back-end.
	 *
	 * Since the Common widget's controls stack could be added to the Controls Manager's stack cache before these tests
	 * are run, we need to remove it from the stack cache,so it is re-registered with the Responsive Control Duplication
	 * Mode set to 'on', in order for the common to be registered with all duplicated responsive controls.
	 */
	private function setup_responsive_control_condition_test() {
		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( 'on' );

		Plugin::$instance->controls_manager->delete_stack( $this->get_common_widget_instance() );
	}

	/**
	 * Cleanup - is_control_visible() test
	 *
	 * The Responsive Control Duplication Mode is reset to it's initial state.
	 * The Common widget's control stack is removed from the Controls Manager stack cache, so it will be re-initialized
	 * with the initial Responsive Control Duplication Mode whenever it is required in later-running tests.
	 *
	 * @param string $initial_duplication_mode
	 * @return void
	 */
	private function cleanup_is_control_visible_test( string $initial_duplication_mode ) {
		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_duplication_mode );

		Plugin::$instance->controls_manager->delete_stack( $this->get_common_widget_instance() );
	}

	private function get_common_widget_instance() {
		return Plugin::$instance->widgets_manager->get_widget_types( 'common' );
	}
}
