<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * An 'Order By' select box control.
 *
 *	@param array $default {
 * 		@type string $order_by      The selected order
 *                                  Default empty
 * 		@type string $reverse_order Whether to reverse the order
 *                                  Default empty
 * }
 *
 * @param array $options      Array of key & value pairs: `[ 'key' => 'value', ... ]`
 *                            Default empty
 *
 * @since 1.0.0
 */
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
		$control_uid = $this->get_control_uid();

		$reverse_order_control_uid = $this->get_control_uid( 'reverse_order' );
		?>
		<div class="elementor-control-field">
			<label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
			<div class="elementor-control-input-wrapper">
				<div class="elementor-control-oreder-wrapper">
					<select id="<?php echo $control_uid; ?>" data-setting="order_by">
						<# _.each( data.options, function( option_title, option_value ) { #>
							<option value="{{ option_value }}">{{{ option_title }}}</option>
							<# } ); #>
					</select>
					<input id="<?php echo $reverse_order_control_uid; ?>" type="checkbox" data-setting="reverse_order">
					<label for="<?php echo $reverse_order_control_uid; ?>" class="elementor-control-order-label">
						<i class="fa fa-sort-amount-desc"></i>
					</label>
				</div>
			</div>
		</div>
		<# if ( data.description ) { #>
			<div class="elementor-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}
}
