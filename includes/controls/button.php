<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor button control.
 *
 * A base control for creating a button control. Displays a button that can trigger an event.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'delete_content',
 *    	[
 *    		'label' => __( 'Delete Content', 'plugin-domain' ),
 *    		'type' => Controls_Manager::BUTTON,
 *    		'button_type' => 'success',
 *    		'text' => __( 'Delete', 'plugin-domain' ),
 *    		'event' => 'namespace:editor:delete',
 *    		'separator' => 'before',
 *    	]
 *    );
 *
 * @since 1.9.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $button_type Optional. Set button type. Available values are
 *                            'default', 'success'. Default is 'default'.
 * @param string $text        Set button text. Default is empty.
 * @param string $event       Set the event the button will trigger. The event will
 *                            be triggered via `elementor.channels.editor.on( event )`
 *                            Default is empty.
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
class Control_Button extends Base_UI_Control {

	/**
	 * Retrieve button control type.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'button';
	}

	/**
	 * Retrieve button control default settings.
	 *
	 * Get the default settings of the button control. Used to
	 * return the default settings while initializing the button
	 * control.
	 *
	 * @since 1.9.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'button_type' => 'default',
		];
	}

	/**
	 * Render button control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.9.0
	 * @access public
	 */
	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<button type="button" class="elementor-button elementor-button-{{{ data.button_type }}}" data-event="{{{ data.event }}}">{{{ data.text }}}</button>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
