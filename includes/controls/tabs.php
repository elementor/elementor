<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor tabs control.
 *
 * A base control for creating tabs control. Displays a tabs header for `tab`
 * controls.
 *
 * Note: Do not use it directly, instead use: `$widget->start_controls_tabs()`
 * and in the end `$widget->end_controls_tabs()`.
 *
 * @since 1.0.0
 */
class Control_Tabs extends Base_UI_Control {

	/**
	 * Retrieve tabs control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'tabs';
	}

	/**
	 * Render tabs control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {}

	/**
	 * Retrieve tabs control default settings.
	 *
	 * Get the default settings of the tabs control. Used to return the
	 * default settings while initializing the tabs control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'separator' => 'none',
		];
	}
}
