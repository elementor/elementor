<?php
namespace Elementor\Tests\Phpunit\Includes\Base;

use Elementor\Plugin;
use Elementor\Widget_Common;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Controls_Stack extends Elementor_Test_Base {

	/**
	 * Element with a responsive condition
	 *
	 * @var array
	 */
	static $element_with_conditions_mock = [
		'id' => '5b2c8e4',
		'elType' => 'widget',
		'isInner' => false,
		'settings' => [
			'text' => 'Click here',
			'_element_width' => '',
			'_element_width_mobile' => 'initial',
		],
		'elements' => [],
		'widgetType' => 'button',
	];

	public function test_is_control_visible_when_condition_met() {
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		/**
		 * Arrange
		 *
		 * The test case here is checking that the method works properly for CSS Generation, which requires
		 * responsive control duplication in the back-end.
		 *
		 * Since the Common widget's controls stack is added to the Controls Manager's stack cache before this test is
		 * run, we need to remove it and re-register it with the Responsive Control Duplication Mode set to 'on', in
		 * order for it to be registered with all responsive controls duplicated.
		 */
		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( 'on' );

		$this->remove_common_widget_stack_from_controls_manager_cache();

		/**
		 * Act
		 */
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::$element_with_conditions_mock );

		$widget_custom_width_control = $widget_instance->get_controls( '_element_custom_width_mobile' );

		$is_control_visible = $widget_instance->is_control_visible( $widget_custom_width_control, $widget_instance->get_settings() );

		/**
		 * Assert
		 */
		$this->assertTrue( $is_control_visible );

		/**
		 * Cleanup
		 */
		$this->cleanup_is_control_visible_test( $initial_duplication_mode );
	}

	public function test_is_control_visible_when_condition_unmet() {
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		/**
		 * Arrange
		 *
		 * The test case here is checking that the method works properly for CSS Generation, which requires
		 * responsive control duplication in the back-end.
		 *
		 * Since the Common widget's controls stack is added to the Controls Manager's stack cache before this test is
		 * run, we need to remove it from the stack cache,so it is re-registered with the Responsive Control Duplication
		 * Mode set to 'on', in order for it to be registered with all responsive controls duplicated.
		 */
		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( 'on' );

		$this->remove_common_widget_stack_from_controls_manager_cache();

		$widget_data = self::$element_with_conditions_mock;

		$widget_data['settings']['_element_width_mobile'] = '';

		/**
		 * Act
		 */
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $widget_data );

		$widget_custom_width_control = $widget_instance->get_controls( '_element_custom_width_mobile' );

		$is_control_visible = $widget_instance->is_control_visible( $widget_custom_width_control, $widget_instance->get_settings() );

		/**
		 * Assert
		 */
		$this->assertFalse( $is_control_visible );

		/**
		 * Cleanup
		 */
		$this->cleanup_is_control_visible_test( $initial_duplication_mode );
	}

	private function remove_common_widget_stack_from_controls_manager_cache() {
		/** @var Widget_Common $common_widget */
		$common_widget = Plugin::$instance->widgets_manager->get_widget_types( 'common' );
		Plugin::$instance->controls_manager->delete_stack( $common_widget );
	}

	/**
	 * Cleanup - is_control_visible() test
	 *
	 * The Responsive Control Duplication Mode is reset to it's initial state.
	 * The Common widget's control stack is removed from the Controls Manager stack cache so it will be re-initialized
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
