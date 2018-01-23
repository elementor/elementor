<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor base data control.
 *
 * A base control for creating data controls.
 *
 * @since 1.5.0
 * @abstract
 */
abstract class Base_Data_Control extends Base_Control {

	/**
	 * Get data control default value.
	 *
	 * Retrieve the default value of the data control. Used to return the default
	 * values while initializing the data control.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @return string Control default value.
	 */
	public function get_default_value() {
		return '';
	}

	/**
	 * Get data control value.
	 *
	 * Retrieve the value of the data control from a specific widget settings.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param array $control Control
	 * @param array $widget  Widget
	 *
	 * @return mixed Control values.
	 */
	public function get_value( $control, $widget ) {
		if ( ! isset( $control['default'] ) ) {
			$control['default'] = $this->get_default_value();
		}

		if ( ! isset( $widget[ $control['name'] ] ) ) {
			return $control['default'];
		}

		return $widget[ $control['name'] ];
	}

	/**
	 * Get data control style value.
	 *
	 * Retrieve the style of the control. Used when adding CSS rules to the control
	 * while extracting CSS from the `selectors` data argument.
	 *
	 * @since 1.5.0
	 * @access public
	 *
	 * @param string $css_property  CSS property.
	 * @param string $control_value Control value.
	 *
	 * @return string Control style value.
	 */
	public function get_style_value( $css_property, $control_value ) {
		return $control_value;
	}

	/**
	 * Get data control unique ID.
	 *
	 * Retrieve the unique ID of the control. Used to set a uniq CSS ID for the
	 * element.
	 *
	 * @since 1.5.0
	 * @access protected
	 *
	 * @param string $input_type Input type. Default is 'default'.
	 *
	 * @return string Unique ID.
	 */
	protected function get_control_uid( $input_type = 'default' ) {
		return 'elementor-control-' . $input_type . '-{{{ data._cid }}}';
	}
}
