<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor code control.
 *
 * A base control for creating code control. Displays a code editor textarea.
 * Based on Ace editor (@see https://ace.c9.io/).
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'custom_html',
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
 *    echo '<code>' . $this->get_settings( 'custom_html' ) . '</code>';
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <code>{{{ settings.custom_html }}}</code>
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
 * @param string $default     Optional. The field default value.
 * @param int    $rows        Optional. Number of rows. Default is 10.
 * @param string $language    Optional. Any language supported by Ace editor
 *                            (@see https://ace.c9.io/build/kitchen-sink.html).
 *                            Default is 'html'.
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
class Control_Code extends Base_Data_Control {

	/**
	 * Retrieve code control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'code';
	}

	/**
	 * Retrieve code control default settings.
	 *
	 * Get the default settings of the code control. Used to return the default
	 * settings while initializing the code control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_block' => true,
			'language' => 'html', // html/css
			'rows' => 10,
		];
	}

	/**
	 * Render code control output in the editor.
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
				<textarea id="<?php echo $control_uid; ?>" rows="{{ data.rows }}" class="elementor-input-style elementor-code-editor" data-setting="{{ data.name }}"></textarea>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
