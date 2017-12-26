<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor tab control.
 *
 * A base control for creating tab control. Displays a tab header for a set of
 * controls.
 *
 * Note: Do not use it directly, instead use: `$widget->start_controls_tab()`
 * and in the end `$widget->end_controls_tab()`.
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param int    $tab         Optional. The tab control. Available values are
 *                            `Controls_Manager::TAB_CONTENT`, `Controls_Manager::TAB_STYLE`,
 *                            `Controls_Manager::TAB_ADVANCED`, `Controls_Manager::TAB_RESPONSIVE`,
 *                            `Controls_Manager::TAB_LAYOUT` or `Controls_Manager::TAB_SETTINGS`.
 */
class Control_Tab extends Base_UI_Control {

	/**
	 * Retrieve tab control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'tab';
	}

	/**
	 * Render tab control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		?>
			<div class="elementor-panel-tab-heading">
				{{{ data.label }}}
			</div>
		<?php
	}

	/**
	 * Retrieve tab control default settings.
	 *
	 * Get the default settings of the tab control. Used to return the
	 * default settings while initializing the tab control.
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
