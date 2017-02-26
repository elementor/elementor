<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A single Checkbox control
 *
 * @param string $default     Whether to initial it as checked. 'on' for checked, and '' (empty string) for unchecked
 *                            Default ''
 *
 * @since 1.0.0
 */
class Control_Checkbox extends Control_Base {

	public function get_type() {
		return 'checkbox';
	}

	public function content_template() {
		?>
		<label class="elementor-control-title">
			<input type="checkbox" data-setting="{{ data.name }}" />
			<span>{{{ data.label }}}</span>
		</label>
		<# if ( data.description ) { #>
		<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
