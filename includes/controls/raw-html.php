<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor raw HTML control.
 *
 * A base control for creating raw HTML control. Displays HTML markup between
 * controls in the panel.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'html_message',
 *    	[
 *    		'type' => Controls_Manager::RAW_HTML,
 *    		'raw' => __( 'An important message to show in the panel.', 'your-plugin' ),
 *    		'content_classes' => 'your-class',
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $label           Optional. The label that appears above of the
 *                                field. Default is empty.
 * @param string $description     Optional. The description that appears below
 *                                the field. Default is empty.
 * @param string $raw             Optional. The HTML markup. Default is empty.
 * @param string $content_classes Optional. CSS classes to add to the HTML
 *                                wrapper. Default is empty.
 * @param string $separator       Optional. Set the position of the control
 *                                separator. Available values are 'default',
 *                                'before', 'after' and 'none'. 'default' will
 *                                position the separator depending on the control
 *                                type. 'before' / 'after' will position the
 *                                separator before/after the control. 'none' will
 *                                hide the separator. Default is 'default'.
 * @param bool   $show_label      Optional. Whether to display the label.
 *                                Default is true.
 * @param bool   $label_block     Optional. Whether to display the label in a
 *                                separate line. Default is false.
 */
class Control_Raw_Html extends Base_UI_Control {

	/**
	 * Retrieve raw html control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'raw_html';
	}

	/**
	 * Render raw html control output in the editor.
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
		<# if ( data.label ) { #>
		<span class="elementor-control-title">{{{ data.label }}}</span>
		<# } #>
		<div class="elementor-control-raw-html {{ data.content_classes }}">{{{ data.raw }}}</div>
		<?php
	}

	/**
	 * Retrieve raw html control default settings.
	 *
	 * Get the default settings of the raw html control. Used to return the
	 * default settings while initializing the raw html control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'content_classes' => '',
		];
	}
}
