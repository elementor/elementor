<?php
namespace Elementor\Tests\Phpunit\Includes\Base;

use Elementor\Plugin;
use Elementor\Tests\Phpunit\Responsive_Control_Testing_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Controls_Stack extends Elementor_Test_Base {

	use Responsive_Control_Testing_Trait;

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

		$this->setup_responsive_control_condition_test();

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

		$this->setup_responsive_control_condition_test();

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
}
