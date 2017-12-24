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
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	'order',
 *    	[
 *    		'label' => __( 'Order', 'plugin-domain' ),
 *    		'type' => Controls_Manager::ORDER,
 *    		'default' => __( 'Default text', 'plugin-domain' ),
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param array  $default     {
 *     Optional. Defautl order value.
 *
 *     @type string $order_by      Optional. The selected order. Default is
 *                                 empty.
 *     @type string $reverse_order Optional. Whether to reverse the order.
 *                                 Default is empty.
 * }
 * @param array $options      Optional. An array of key => value pairs:
 *                            `[ 'key' => 'value', ... ]`
 *                            Default is empty.
 * @param string $separator   Optional. Set the position of the control separator.
 *                            Available values are 'default', 'before', 'after'
 *                            and 'none'. 'default' will position the separator
 *                            depending on the control type. 'before' / 'after'
 *                            will position the separator before/after the
 *                            control. 'none' will hide the separator. Default
 *                            is 'default'.
 * @param bool   $show_label  Optional. Whether to display the label. Default is
 *                            true.
 * @param bool   $label_block Optional. Whether to display the label in a
 *                            separate line. Default is false.
 */
class Control_Order extends Control_Base_Multiple {

	/**
	 * Retrieve order control type.
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
	 * Retrieve order control default values.
	 *
	 * Get the default value of the order control. Used to return the default
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
