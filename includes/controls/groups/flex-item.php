<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Flex_Item extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'flex-item';
	}

	protected function init_fields() {
		$fields = [];

		$fields['flex_basis'] = [
			'label' => _x( 'Flex Basis', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 1000,
				],
				'%' => [
					'min' => 0,
					'max' => 100,
				],
			],
			'size_units' => [ 'px', '%' ],
			'selectors' => [
				'{{SELECTOR}}' => 'flex-basis: {{SIZE}}{{UNIT}};',
			],
			'responsive' => true,
		];

		$fields['flex_grow'] = [
			'label' => _x( 'Flex Grow', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'selectors' => [
				'{{SELECTOR}}' => 'flex-grow: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['flex_shrink'] = [
			'label' => _x( 'Flex Shrink', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'selectors' => [
				'{{SELECTOR}}' => 'flex-shrink: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['order'] = [
			'label' => _x( 'Order', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::NUMBER,
			'selectors' => [
				'{{SELECTOR}}' => 'order: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_self'] = [
			'label' => _x( 'Align Self', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'auto' => _x( 'Auto', 'Flex Item Control', 'elementor' ),
				'flex-start' => _x( 'Flex Start', 'Flex Item Control', 'elementor' ),
				'flex-end' => _x( 'Flex End', 'Flex Item Control', 'elementor' ),
				'center' => _x( 'Center', 'Flex Item Control', 'elementor' ),
				'baseline' => _x( 'Baseline', 'Flex Item Control', 'elementor' ),
				'stretch' => _x( 'Stretch', 'Flex Item Control', 'elementor' ),
			],
			'selectors' => [
				'{{SELECTOR}}' => 'align-self: {{VALUE}};',
			],
			'responsive' => true,
		];

		return $fields;
	}

	protected function get_default_options() {
		return [
			'popover' => false,
		];
	}
}
