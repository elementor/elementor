<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor WYSIWYG control.
 *
 * A base control for creating WYSIWYG control. Displays a WordPress WYSIWYG
 * (TinyMCE) editor.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'item_description',
 *    	[
 *    		'label' => __( 'Description', 'plugin-domain' ),
 *    		'type' => Controls_Manager::WYSIWYG,
 *    		'default' => __( 'Default description', 'plugin-domain' ),
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<div class="description">' . $this->get_settings( 'item_description' ) . '</div>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div class="description">{{{ settings.item_description }}}</div>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $title       Optional. The field title that appears on mouse
 *                            hover. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $default     Optional. The field default value.
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
 *                            separate line. Default is false.
 */
class Control_Wysiwyg extends Base_Data_Control {

	/**
	 * Retrieve wysiwyg control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'wysiwyg';
	}

	/**
	 * Render wysiwyg control output in the editor.
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
		<label>
			<span class="elementor-control-title">{{{ data.label }}}</span>
			<textarea data-setting="{{ data.name }}"></textarea>
		</label>
		<?php
	}
}
