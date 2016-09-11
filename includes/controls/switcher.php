<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Switcher extends Control_Base {

	public function get_type() {
		return 'switcher';
	}

	public function content_template() {
		?>
		<# var dataLabelOn = '', dataLabelOff = '';
			if ( data.label_on ) {
				dataLabelOff = ' data-off=' + data.label_off;
			}
			if ( data.label_off ) {
				dataLabelOn = ' data-on=' + data.label_on;
			}

			#>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<label class="elementor-switch">
					<input type="checkbox" data-setting="{{ data.name }}" class="elementor-switch-input" value="{{ data.return_value }}">
					<span class="elementor-switch-label" {{ dataLabelOn }} {{ dataLabelOff }}></span>
					<span class="elementor-switch-handle"></span>
				</label>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_off' => '',
			'label_on' => '',
			'return_value' => 'yes',
		];
	}
}
