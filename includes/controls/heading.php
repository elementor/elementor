<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor heading control.
 *
 * A base control for creating heading control. Displays a text heading between
 * controls in the panel.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'title',
 *    	[
 *    		'label' => __( 'Title', 'plugin-domain' ),
 *    		'type' => Controls_Manager::HEADING,
 *    		'description' => __( 'My Header', 'plugin-domain' ),
 *    		'separator' => 'before',
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is true.
 */
class Control_Heading extends Base_UI_Control {

	/**
	 * Retrieve heading control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'heading';
	}

	/**
	 * Retrieve heading control default settings.
	 *
	 * Get the default settings of the heading control. Used to return the
	 * default settings while initializing the heading control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}

	/**
	 * Render heading control output in the editor.
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
		<div class="elementor-control-field">
			<h3 class="elementor-control-title">{{ data.label }}</h3>
		</div>
		<?php
	}
}
