<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor switcher control.
 *
 * A base control for creating switcher control. Displays an on/off switcher,
 * basically a fancy UI representation of a checkbox.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'show_title',
 *    	[
 *    		'label' => __( 'Show Title', 'plugin-domain' ),
 *    		'type' => Controls_Manager::SWITCHER,
 *    		'default' => 'yes',
 *    		'return_value' => 'yes',
 *    		'label_off' => __( 'Hide', 'plugin-domain' ),
 *    		'label_on' => __( 'Show', 'plugin-domain' ),
 *    	]
 *    );
 *
 * PHP usage (inside `Widget_Base::render()` method):
 *
 *    $settings = $this->get_settings();
 *    if ( 'yes' === $settings['show_title'] ) {
 *    	echo '<h2>' . $settings['title'] . '</h2>';
 *    }
 *
 * JS usage (inside `Widget_Base::_content_template()` method):
 *
 *    <# if ( 'yes' === settings.show_title ) { #>
 *    	<h2>{{{ settings.title }}}</h2>
 *    <# } #>
 *
 * @since 1.0.0
 *
 * @param string $label        Optional. The label that appears next of the
 *                             field. Default is empty.
 * @param string $title        Optional. The field title that appears on mouse
 *                             hover. Default is empty.
 * @param string $placeholder  Optional. The field placeholder that appears when
 *                             the field has no values. Default is empty.
 * @param string $description  Optional. The description that appears below the
 *                             field. Default is empty.
 * @param mixed  $default      Optional. The field default value.
 * @param string $return_value Optional. The value returned when checked.
 *                             Default is 'yes'.
 * @param string $label_off    Optional. The label for the "unchecked" state
 *                             Default is `__( 'No', 'elementor' )`.
 * @param string $label_on     Optional. The label for the "checked" state.
 *                             Default is `__( 'Yes', 'elementor' )`.
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
class Control_Switcher extends Base_Data_Control {

	/**
	 * Retrieve switcher control type.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'switcher';
	}

	/**
	 * Render switcher control output in the editor.
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
				<label class="elementor-switch">
					<input id="<?php echo $control_uid; ?>" type="checkbox" data-setting="{{ data.name }}" class="elementor-switch-input" value="{{ data.return_value }}">
					<span class="elementor-switch-label" data-on="{{ data.label_on }}" data-off="{{ data.label_off }}"></span>
					<span class="elementor-switch-handle"></span>
				</label>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Retrieve switcher control default settings.
	 *
	 * Get the default settings of the switcher control. Used to return the
	 * default settings while initializing the switcher control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_off' => __( 'No', 'elementor' ),
			'label_on' => __( 'Yes', 'elementor' ),
			'return_value' => 'yes',
		];
	}
}
