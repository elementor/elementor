<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor text control.
 *
 * A base control for creating text control. Displays a simple text input.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'widget_title',
 *    	[
 *    		'label' => __( 'Text', 'plugin-domain' ),
 *    		'type' => Controls_Manager::TEXT,
 *    		'default' => __( 'Default text', 'plugin-domain' ),
 *    		'placeholder' => __( 'Type your text here', 'plugin-domain' ),
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    echo '<h2>' . $this->get_settings( 'widget_title' ) . '</h2>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <h2>{{{ settings.widget_title }}}</h2>
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $title       Optional. The field title that appears on mouse
 *                            hover. Default is empty.
 * @param string $placeholder Optional. The field placeholder that appears when
 *                            the field has no values. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param mixed  $default     Optional. The field default value.
 * @param string $input_type  Optional. Any valid HTML5 input type: text, email,
 *                            url, tel, etc. Default is 'text'.
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
class Control_Text extends Base_Data_Control {

	/**
	 * Retrieve text control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'text';
	}

	/**
	 * Render text control output in the editor.
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
				<input id="<?php echo $control_uid; ?>" type="{{ data.input_type }}" class="tooltip-target" data-tooltip="{{ data.title }}" title="{{ data.title }}" data-setting="{{ data.name }}" placeholder="{{ data.placeholder }}" />
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Retrieve text control default settings.
	 *
	 * Get the default settings of the text control. Used to return the
	 * default settings while initializing the text control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'input_type' => 'text',
		];
	}
}
