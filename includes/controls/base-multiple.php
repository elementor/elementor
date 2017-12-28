<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor base multiple control.
 *
 * A base control for creating controls that return more than a single value.
 * Each value of the multi-value control will be returned as an item in a
 * key => value array.
 *
 * @since 1.0.0
 * @abstract
 */
abstract class Control_Base_Multiple extends Base_Data_Control {

	/**
	 * Retrieve multiple control default value.
	 *
	 * Get the default value of the multiple control. Used to return the default
	 * values while initializing the multiple control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [];
	}

	/**
	 * Retrieve multiple control value.
	 *
	 * Get the value of the multiple control from a specific widget settings.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $control Control
	 * @param array $widget  Widget
	 *
	 * @return mixed Control values.
	 */
	public function get_value( $control, $widget ) {
		$value = parent::get_value( $control, $widget );

		if ( empty( $control['default'] ) ) {
			$control['default'] = [];
		}

		if ( ! is_array( $value ) ) {
			$value = [];
		}

		$control['default'] = array_merge(
			$this->get_default_value(),
			$control['default']
		);

		return array_merge(
			$control['default'],
			$value
		);
	}

	/**
	 * Retrieve multiple control style value.
	 *
	 * Get the style of the control. Used when adding CSS rules to the control
	 * while extracting CSS from the `selectors` data argument.
	 *
	 * @since 1.0.5
	 * @access public
	 *
	 * @param string $css_property  CSS property.
	 * @param string $control_value Control value.
	 *
	 * @return array Control style value.
	 */
	public function get_style_value( $css_property, $control_value ) {
		return $control_value[ $css_property ];
	}
}
