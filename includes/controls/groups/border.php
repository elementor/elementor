<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Border extends Group_Control_Base {

	public static function get_type() {
		return 'border';
	}

	protected function _get_controls( $args ) {
		$controls = [];

		$controls['border'] = [
			'label' => _x( 'Border Type', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => __( 'None', 'elementor' ),
				'solid' => __( 'Solid', 'elementor', 'elementor' ),
				'double' => __( 'Double', 'elementor', 'elementor' ),
				'dotted' => __( 'Dotted', 'elementor', 'elementor' ),
				'dashed' => __( 'Dashed', 'elementor', 'elementor' ),
			],
			'selectors' => [
				$args['selector'] => 'border-style: {{VALUE}};',
			],
			'separator' => 'before',
		];

		$controls['width'] = [
			'label' => _x( 'Width', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::DIMENSIONS,
			'selectors' => [
				$args['selector'] => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
			],
			'condition' => [
				'border!' => '',
			],
		];

		$controls['color'] = [
			'label' => _x( 'Color', 'Border Control', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'default' => '',
			'alpha' => true,
			'tab' => $args['tab'],
			'selectors' => [
				$args['selector'] => 'border-color: {{VALUE}};',
			],
			'condition' => [
				'border!' => '',
			],
		];

		return $controls;
	}
}
