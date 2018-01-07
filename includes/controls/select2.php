<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor select2 control.
 *
 * A base control for creating select2 control. Displays a select box control
 * based on select2 jQuery plugin @see https://select2.github.io/ .
 * Accepts an array in which the `key` is the value and the `value` is the option
 * name. Set `multiple` to `true` to allow multiple value selection.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'show_elements',
 *    	[
 *    		'label' => __( 'Show Elements', 'plugin-domain' ),
 *    		'type' => Controls_Manager::SELECT2,
 *    		'default' => 'solid',
 *    		'options' => [
 *    			'title' => __( 'Title', 'plugin-domain' ),
 *    			'description' => __( 'Description', 'plugin-domain' ),
 *    			'button' => __( 'Button', 'plugin-domain' ),
 *    		],
 *    		'multiple' => true,
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $show_elements = $this->get_settings( 'show_elements' );
 *    foreach ( $show_elements as $element ) {
 *    	echo '<div>' . $element . '</div>';
 *    }
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# _.each( settings.show_elements, function( element ) { #>
 *    	<div>{{{ element }}}</div>
 *    <# } #>
 *
 * @since 1.0.0
 *
 * @param string $label         Optional. The label that appears next of the
 *                              field. Default is empty.
 * @param string $title         Optional. The field title that appears on mouse
 *                              hover. Default is empty.
 * @param string $description   Optional. The description that appears below the
 *                              field. Default is empty.
 * @param string|array $default Optional. The selected option key, or an array
 *                              of selected values if `multiple == true`.
 *                              Default is empty.
 * @param array  $options       Optional. An array of `key => value` pairs:
 *                              `[ 'key' => 'value', ... ]`
 *                              Default is empty.
 * @param bool   $multiple      Optional. Whether to allow multiple value
 *                              selection. Default is false.
 * @param string $separator     Optional. Set the position of the control separator.
 *                              Available values are 'default', 'before', 'after'
 *                              and 'none'. 'default' will position the separator
 *                              depending on the control type. 'before' / 'after'
 *                              will position the separator before/after the
 *                              control. 'none' will hide the separator. Default
 *                              is 'default'.
 * @param bool   $show_label    Optional. Whether to display the label. Default
 *                              is true.
 * @param bool   $label_block   Optional. Whether to display the label in a
 *                              separate line. Default is false.
 */
class Control_Select2 extends Base_Data_Control {

	/**
	 * Retrieve select2 control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'select2';
	}

	/**
	 * Retrieve select2 control default settings.
	 *
	 * Get the default settings of the select2 control. Used to return the
	 * default settings while initializing the select2 control.
	 *
	 * @since 1.8.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'multiple' => false,
		];
	}

	/**
	 * Render select2 control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<# var multiple = ( data.multiple ) ? 'multiple' : ''; #>
				<select id="<?php echo $control_uid; ?>" class="elementor-select2" type="select2" {{ multiple }} data-setting="{{ data.name }}">
					<# _.each( data.options, function( option_title, option_value ) {
						var value = data.controlValue;
						if ( typeof value == 'string' ) {
							var selected = ( option_value === value ) ? 'selected' : '';
						} else if ( null !== value ) {
							var value = _.values( value );
							var selected = ( -1 !== value.indexOf( option_value ) ) ? 'selected' : '';
						}
						#>
					<option {{ selected }} value="{{ option_value }}">{{{ option_title }}}</option>
					<# } ); #>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
