<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A Date/Time Picker control.
 *
 * @param string $default           A date in mysql format (YYYY-mm-dd HH:ii)
 *                                  Default empty
 * @param array  $picker_options    The picker config. @see http://mugifly.github.io/jquery-simple-datetimepicker/jquery.simple-dtpicker.html
 *                                  Default empty array
 * @since 1.0.0
 */
class Control_Date_Time extends Control_Base {

	public function get_type() {
		return 'date_time';
	}

	function get_default_settings() {
		return [
			'picker_options' => [],
			'label_block' => true,
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<input class="elementor-date-time-picker" type="text" data-setting="{{ data.name }}">
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
