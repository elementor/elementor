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
 * @since 1.0.0
 * @deprecated 1.5.4 Use `Control_Switcher` class instead.
 */
class Control_Checkbox extends Base_Data_Control {

	/**
	 * Get checkbox control type.
	 *
	 * Retrieve the control type, in this case `checkbox`.
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
	 * Get checkbox control value.
	 *
	 * Retrieve the value of the checkbox control from a specific widget.
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
