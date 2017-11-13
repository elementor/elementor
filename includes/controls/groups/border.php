<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Border control.
 *
 * A base control for creating border control. Displays input fields to define
 * border type, border width and border color.
 *
 * Creating new control in the editor (inside `Widget_Base::_register_controls()`
 * method):
 *
 *    $this->add_control(
 *    	Group_Control_Border::get_type(),
 *    	[
 *          'name' => 'border',
 *    		'label' => __( 'Border', 'plugin-domain' ),
 *    		'placeholder' => '1px',
 *    		'default' => '1px',
 *    		'separator' => 'before',
 *    		'selector' => '{{WRAPPER}} .wrapper',
 *    	]
 *    );
 *
 * @since 1.0.0
 *
 * @param string $name        Optional. The field name. Default is empty.
 * @param string $label       Optional. The label that appears above of the
 *                            field. Default is empty.
 * @param string $description Optional. The description that appears below the
 *                            field. Default is empty.
 * @param string $placeholder Optional. The field placeholder that appears when
 *                            the field has no values. Default is empty.
 * @param string $default     Optional. The default border size. Default is empty.
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
class Group_Control_Border extends Group_Control_Base {

	/**
	 * Fields.
	 *
	 * Holds all the border control fields.
	 *
	 * @since 1.0.0
	 * @access protected
	 * @static
	 *
	 * @var array Border control fields.
	 */
	protected static $fields;

	/**
	 * Retrieve type.
	 *
	 * Get border control type.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'border';
	}

	/**
	 * Init fields.
	 *
	 * Initialize border control fields.
	 *
	 * @since 1.2.2
	 * @access protected
	 *
	 * @return array Control fields.
	 */
	protected function init_fields() {
		$fields = [];

		$fields['border'] = [
			'label' => _x( 'Border Type', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => __( 'None', 'elementor' ),
				'solid' => _x( 'Solid', 'Border Control', 'elementor' ),
				'double' => _x( 'Double', 'Border Control', 'elementor' ),
				'dotted' => _x( 'Dotted', 'Border Control', 'elementor' ),
				'dashed' => _x( 'Dashed', 'Border Control', 'elementor' ),
			],
			'selectors' => [
				'{{SELECTOR}}' => 'border-style: {{VALUE}};',
			],
		];

		$fields['width'] = [
			'label' => _x( 'Width', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::DIMENSIONS,
			'selectors' => [
				'{{SELECTOR}}' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
			],
			'condition' => [
				'border!' => '',
			],
		];

		$fields['color'] = [
			'label' => _x( 'Color', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'default' => '',
			'selectors' => [
				'{{SELECTOR}}' => 'border-color: {{VALUE}};',
			],
			'condition' => [
				'border!' => '',
			],
		];

		return $fields;
	}
}
