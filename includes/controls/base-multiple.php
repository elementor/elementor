<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A base control for controls that return more than a single value. Extends `Control_Base`.
 * Each value of a multiple-value control will be returned as an item in a key => value array
 *
 * @since 1.0.0
 */
abstract class Control_Base_Multiple extends Control_Base {

	public function get_default_value() {
		return [];
	}

	public function get_value( $control, $widget ) {
		$value = parent::get_value( $control, $widget );

		if ( empty( $control['default'] ) )
			$control['default'] = [];

		if ( ! is_array( $value ) )
			$value = [];

		$control['default'] = array_merge(
			$this->get_default_value(),
			$control['default']
		);

		return array_merge(
			$control['default'],
			$value
		);
	}

	public function get_style_value( $css_property, $control_value ) {
		return $control_value[ $css_property ];
	}
}
