<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Order extends Control_Base_Multiple {

	public function get_type() {
		return 'order';
	}

	public function get_default_value() {
		return [
			'order_by' => '',
			'reverse_order' => '',
		];
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-oreder-wrapper">
					<select data-setting="order_by">
						<# _.each( data.options, function( option_title, option_value ) { #>
							<option value="{{ option_value }}">{{{ option_title }}}</option>
							<# } ); #>
					</select>
					<input id="elementor-control-order-input-{{ data._cid }}" type="checkbox" data-setting="reverse_order">
					<label for="elementor-control-order-input-{{ data._cid }}" class="elementor-control-order-label">
						<i class="fa fa-sort-amount-desc"></i>
					</label>
				</div>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
