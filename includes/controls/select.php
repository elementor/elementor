<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * A simple Select box control.
 *
 * @param string $default     The selected option key
 *                            Default empty
 * @param array $options      Array of key & value pairs: `[ 'key' => 'value', ... ]`
 *                            Default empty
 *
 * @since 1.0.0
 */
class Control_Select extends Control_Base {

	public function get_type() {
		return 'select';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<select data-setting="{{ data.name }}">
				<# _.each( data.options, function( option_title, option_value ) { #>
					<option value="{{ option_value }}">{{{ option_title }}}</option>
				<# } ); #>
				</select>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
