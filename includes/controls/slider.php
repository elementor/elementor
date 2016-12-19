<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Range Slider control.
 *
 * @param array  $default    {
 *
 * 		@type integer $size       The initial value of slider
 *                           	  Default empty
 * 		@type string  $unit       The selected unit type from $size_units (px|em|rem|%|deg)
 *                           	  Default 'px'
 * }
 *
 * @param array  $size_units The allowed unit types
 *
 * The range param is default populated with ranges for px|em|rem|%|deg @see Control_Base_Units::get_default_settings()
 *
 * @param array  $range {
 *     {
 * 		@type integer $min        The minimum value of range
 * 		@type integer $max        The maximum value of range
 * 		@type integer $step       The interval that the slider moves on
 *    },
 *    ...
 * }
 *
 * @since              1.0.0
 */
class Control_Slider extends Control_Base_Units {

	public function get_type() {
		return 'slider';
	}

	public function get_default_value() {
		return array_merge( parent::get_default_value(), [
			'size' => '',
		] );
	}

	protected function get_default_settings() {
		return array_merge( parent::get_default_settings(), [
			'label_block' => true,
		] );
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<?php $this->print_units_template(); ?>
			<div class="elementor-control-input-wrapper elementor-clearfix">
				<div class="elementor-slider"></div>
				<div class="elementor-slider-input">
					<input type="number" min="{{ data.min }}" max="{{ data.max }}" step="{{ data.step }}" data-setting="size" />
				</div>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
