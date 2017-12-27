<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor hidden control.
 *
 * A base control for creating hidden control. Used to save additional data in
 * the database without a visual presentation in the panel.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'view',
 *    	[
 *    		'label' => __( 'View', 'plugin-domain' ),
 *    		'type' => Controls_Manager::HIDDEN,
 *    		'default' => 'traditional',
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo $this->get_settings( 'view' );
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    {{{ settings.view }}}
 *
 * @since 1.0.0
 *
 * @param string $label   Optional. The label that appears above of the field.
 *                        But in this case it won't be displayed. Default is empty.
 * @param string $title   Optional. The field title that appears on mouse hover.
 *                        Default is empty.
 * @param string $default Optional. The field default value.
 */
class Control_Hidden extends Base_Data_Control {

	/**
	 * Retrieve hidden control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'hidden';
	}

	/**
	 * Render hidden control output in the editor.
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
		<input type="hidden" data-setting="{{{ data.name }}}" />
		<?php
	}
}
