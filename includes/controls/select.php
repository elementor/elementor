<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor select control.
 *
 * A base control for creating select control. Displays a simple select box.
 * Accepts an array in which the `key` is the value and the `value` is the option name.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'border_style',
 *    	[
 *    		'label' => __( 'Border Style', 'plugin-domain' ),
 *    		'type' => Controls_Manager::SELECT,
 *    		'default' => 'solid',
 *    		'options' => [
 *    			'solid'  => __( 'Solid', 'plugin-domain' ),
 *    			'dashed' => __( 'Dashed', 'plugin-domain' ),
 *    			'dotted' => __( 'Dotted', 'plugin-domain' ),
 *    			'double' => __( 'Double', 'plugin-domain' ),
 *    			'none'   => __( 'None', 'plugin-domain' ),
 *    		],
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<div style="border-style: ' . $this->get_settings( 'border_style' ) . '"> ... </div>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <div style="border-style: {{ settings.border_style }}"> ... </div>
 *
 * @since 1.0.0
 *
 * @param string $label        Optional. The label that appears next of the
 *                             field. Default is empty.
 * @param string $title        Optional. The field title that appears on mouse
 *                             hover. Default is empty.
 * @param string $description  Optional. The description that appears below the
 *                             field. Default is empty.
 * @param string $default      Optional. The field default value.
 * @param array  $options      Optional. An array of `key => value` pairs:
 *                             `[ 'key' => 'value', ... ]`
 *                             Default is empty.
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
class Control_Select extends Base_Data_Control {

	/**
	 * Retrieve select control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'select';
	}

	/**
	 * Render select control output in the editor.
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
				<select id="<?php echo $control_uid; ?>" data-setting="{{ data.name }}">
				<#
					var printOptions = function( options ) {
						_.each( options, function( option_title, option_value ) { #>
								<option value="{{ option_value }}">{{{ option_title }}}</option>
						<# } );
					};

					if ( data.groups ) {
						for ( var groupIndex in data.groups ) {
							var groupArgs = data.groups[ groupIndex ];
								if ( groupArgs.options ) { #>
									<optgroup label="{{ groupArgs.label }}">
										<# printOptions( groupArgs.options ) #>
									</optgroup>
								<# } else if ( _.isString( groupArgs ) ) { #>
									<option value="{{ groupIndex }}">{{{ groupArgs }}}</option>
								<# }
						}
					} else {
						printOptions( data.options );
					}
				#>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
