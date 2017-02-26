<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A classic Textarea control.
 *
 * @param string  $default    A default value
 *                            Default empty
 * @param integer $rows       Number of rows
 *                            Default 5
 *
 * @since 1.0.0
 */
class Control_Textarea extends Control_Base {

	public function get_type() {
		return 'textarea';
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<textarea rows="{{ data.rows || 5 }}" data-setting="{{ data.name }}" placeholder="{{ data.placeholder }}"></textarea>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
