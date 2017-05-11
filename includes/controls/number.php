<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A simple number input control
 *
 * @param integer $default  The default value
 *                          Default empty
 * @param integer $min      The minimum number (Only affects the spinners, the user can still type a lower value)
 *                          Default empty
 * @param integer $max      The maximum number (Only affects the spinners, the user can still type a higher value)
 *                          Default empty
 * @param integer $step     The intervals value that will be incremented or decremented when using the controls' spinners
 *                          Default empty (The value will be incremented by 1)
 *
 * @since 1.0.0
 */
class Control_Number extends Base_Data_Control {

	public function get_type() {
		return 'number';
	}

	public function get_default_settings() {
		return [
			'min' => '',
			'max' => '',
			'step' => '',
		];
	}

	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<input id="<?php echo $control_uid; ?>" type="number" min="{{ data.min }}" max="{{ data.max }}" step="{{ data.step }}" class="tooltip-target" data-tooltip="{{ data.title }}" title="{{ data.title }}" data-setting="{{ data.name }}" placeholder="{{ data.placeholder }}" />
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
