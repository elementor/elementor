<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Checkbox_List extends Control_Base_Multiple {

	public function get_type() {
		return 'checkbox_list';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<# _.each( data.options, function( option_title, option_value ) { #>
					<div>
						<label class="elementor-control-title">
							<input type="checkbox" data-setting="{{ option_value }}" />
							<span>{{{ option_title }}}</span>
						</label>
					</div>
				<# } ); #>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
