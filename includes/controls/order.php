<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor order control.
 *
 * A base control for creating an order control. Displays an 'Order By' select
 * box.
 *
 * @since 1.0.0
 * @deprecated 2.0.0
 */
class Control_Order extends Control_Base_Multiple {

	/**
	 * Get order control type.
	 *
	 * Retrieve the control type, in this case `order`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'order';
	}

	/**
	 * Get order control default values.
	 *
	 * Retrieve the default value of the order control. Used to return the default
	 * values while initializing the order control.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Control default value.
	 */
	public function get_default_value() {
		return [
			'order_by' => '',
			'reverse_order' => '',
		];
	}

	/**
	 * Get order control value.
	 *
	 * Retrieve the value of the order control from a specific Controls_Stack.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param array $control  Control
	 * @param array $settings Controls_Stack settings
	 *
	 * @return mixed Control values.
	 */
	public function get_value( $control, $settings ) {
		_deprecated_file( __CLASS__, '2.0.0' );

		return parent::get_value( $control, $settings );
	}

	/**
	 * Render order control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
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
						<i class="fa fa-sort-amount-desc" aria-hidden="true"></i>
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
