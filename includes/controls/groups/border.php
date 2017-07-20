<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Border extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'border';
	}

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
