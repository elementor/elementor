<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor section control.
 *
 * A base control for creating section control. Displays a header that
 * functions as a toggle to show or hide a set of controls.
 *
 * Note: Do not use it directly, instead use `$widget->start_controls_section()`
 * and `$widget->end_controls_section()` to wrap a set of controls.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->start_controls_section(
 *    	'section_advanced',
 *    	[
 *    		'label' => __( 'Element Style', 'plugin-domain' ),
 *    		'type' => Controls_Manager::SECTION,
 *    		'tab' => Controls_Manager::TAB_ADVANCED,
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param int    $default     Optional. The field default value. Default is
 *                            empty.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'none'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is false.
 */
class Control_Section extends Base_UI_Control {

	/**
	 * Retrieve section control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'section';
	}

	/**
	 * Render section control output in the editor.
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
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-toggle elementor-section-toggle" data-collapse_id="{{ data.name }}">
				<i class="fa" aria-hidden="true"></i>
			</div>
			<div class="elementor-panel-heading-title elementor-section-title">{{{ data.label }}}</div>
		</div>
		<?php
	}

	/**
	 * Retrieve repeater control default settings.
	 *
	 * Get the default settings of the repeater control. Used to return the
	 * default settings while initializing the repeater control.
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
