<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor gap control.
 *
 * A base control for creating a gap control. Displays input fields for two values,
 * row/column, height/width and the option to link them together.
 *
 * @since 3.13.0
 */

class Control_Gaps extends Control_Dimensions {
	/**
	 * Get gap control type.
	 *
	 * Retrieve the control type, in this case `gap`.
	 *
	 * @since 3.13.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'gaps';
	}

	/**
	 * Get gap control default values.
	 *
	 * Retrieve the default value of the gap control. Used to return the default
	 * values while initializing the gap control.
	 *
	 * @since 3.13.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'column' => '',
			'row' => '',
			'isLinked' => true,
			'unit' => 'px',
		];
	}

	public function get_singular_name() {
		return 'gap';
	}

	protected function get_dimensions() {
		return [
			'column' => esc_html__( 'Column', 'elementor' ),
			'row' => esc_html__( 'Row', 'elementor' ),
		];
	}
}
