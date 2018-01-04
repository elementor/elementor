<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor checkbox control.
 *
 * A base control for creating checkbox control. Displays a single checkbox.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'show_title',
 *    	[
 *    		'label' => __( 'Show Title', 'plugin-domain' ),
 *    		'type' => Controls_Manager::CHECKBOX,
 *    		'default' => 'on',
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $settings = $this->get_settings();
 *    if ( 'on' === $settings['show_title'] ) {
 *    	echo '<h2>' . $settings['title'] . '</h2>';
 *    }
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# if ( 'on' === settings.show_title ) { #>
 *    	<h2>{{{ settings.title }}}</h2>
 *    <# } #>
 *
 * @since 1.0.0
 * @deprecated 1.5.4 In favor of Control_Switcher.
 *
 * @param string $label        Optional. The label that appears next of the
 *                             field. Default is empty.
 * @param string $title        Optional. The field title that appears on mouse
 *                             hover. Default is empty.
 * @param string $description  Optional. The description that appears below the
 *                             field. Default is empty.
 * @param string $default      Optional. Whether the checkbox is checked by
 *                             default or not. Available values are `on` for
 *                             checked checkbox, and `` (empty string) for
 *                             unchecked checkbox. Default is ''.
 * @param string $separator    Optional. Set the position of the control separator.
 *                             Available values are 'default', 'before', 'after'
 *                             and 'none'. 'default' will position the separator
 *                             depending on the control type. 'before' / 'after'
 *                             will position the separator before/after the
 *                             control. 'none' will hide the separator. Default
 *                             is 'default'.
 * @param bool   $show_label   Optional. Whether to display the label. Default
 *                             is true.
 * @param bool   $label_block  Optional. Whether to display the label in a
 *                             separate line. Default is false.
 */
class Control_Checkbox extends Base_Data_Control {

	/**
	 * Retrieve checkbox control type.
	 *
	 * @since 1.5.4
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'checkbox';
	}

	/**
	 * Retrieve checkbox control value.
	 *
	 * Get the value of the checkbox control from a specific widget.
	 *
	 * @since 1.5.4
	 * @access public
	 *
	 * @param array $control Control
	 * @param array $widget  Widget
	 *
	 * @return mixed Control values.
	 */
	public function get_value( $control, $widget ) {
		_deprecated_file( __CLASS__, '1.5.4' );

		return parent::get_value( $control, $widget );
	}

	/**
	 * Render checkbox control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.5.4
	 * @access public
	 */
	public function content_template() {
		?>
		<label class="elementor-control-title">
			<input type="checkbox" data-setting="{{ data.name }}" />
			<span>{{{ data.label }}}</span>
		</label>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
			<# } #>
		<?php
	}
}
