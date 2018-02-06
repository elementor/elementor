<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor font control.
 *
 * A base control for creating font control. Displays font select box. The
 * control allows you to set a list of fonts, if non is set it will use Google
 * Fonts (@see https://fonts.google.com/).
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'font_family',
 *    	[
 *    		'label' => __( 'Font Family', 'plugin-domain' ),
 *    		'type' => Controls_Manager::FONT,
 *    		'default' => "'Open Sans', sans-serif",
 *    		'selectors' => [
 *    			'{{WRAPPER}} .title' => 'font-family: {{VALUE}}',
 *    		],
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<h2 class="title" style="font-family:' . $this->get_settings( 'font_family' ) . '"> ... </h2>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <h2 class="title" style="font-family: {{ settings.font_family }}"> ... </h2>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $default     Optional. Default font name. Default is empty.
 * @param array  $options     Optional. An associative array of available fonts.
 *                            `[ 'Font Name' => 'family-name', ... ]`
 *                            Default is a list of Google Fonts @see Fonts::get_fonts()
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
class Control_Font extends Base_Data_Control {

	/**
	 * Retrieve font control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'font';
	}

	/**
	 * Retrieve font control default settings.
	 *
	 * Get the default settings of the font control. Used to return the default
	 * settings while initializing the font control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'groups' => Fonts::get_font_groups(),
			'options' => Fonts::get_fonts(),
		];
	}

	/**
	 * Render font control output in the editor.
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
				<select id="<?php echo $control_uid; ?>" class="elementor-control-font-family" data-setting="{{ data.name }}">
					<option value=""><?php esc_html_e( 'Default', 'elementor' ); ?></option>
					<#
					_.each( data.groups, function( group_label, group_name ) { #>
						<optgroup label="{{ group_label }}">
							<# _.each( getFontsByGroups( group_name ), function( fontType, fontName ) { #>
								<option value="{{ fontName }}">{{{ fontName }}}</option>
							<# } ); #>
						</optgroup>
					<# } );
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
