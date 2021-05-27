<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Flex_Container extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'flex-container';
	}

	protected function init_fields() {
		$fields = [];

		$fields['flex_direction'] = [
			'label' => _x( 'Flex Direction', 'Flex Container Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => _x( 'Default', 'Flex Container Control', 'elementor' ),
				'row' => _x( 'Row', 'Flex Container Control', 'elementor' ),
				'row-reverse' => _x( 'Row Reverse', 'Flex Container Control', 'elementor' ),
				'column' => _x( 'Column', 'Flex Container Control', 'elementor' ),
				'column-reverse' => _x( 'Column Reverse', 'Flex Container Control', 'elementor' ),
			],
			'default' => '',
			'selectors' => [
				'{{SELECTOR}}' => '--flex-direction: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['_flex_is_row'] = [
			'type' => Controls_Manager::HIDDEN,
			'default' => 'row',
			'prefix_class' => 'e-container--placeholder-',
			'conditions' => [
				'relation' => 'or',
				'terms' => [
					[
						'name' => 'flex_direction',
						'value' => '',
					],
					[
						'name' => 'flex_direction',
						'value' => 'row',
					],
					[
						'name' => 'flex_direction',
						'value' => 'row-reverse',
					],
				],
			],
		];

		$fields['flex_wrap'] = [
			'label' => _x( 'Flex Wrap', 'Flex Container Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => _x( 'Default', 'Flex Container Control', 'elementor' ),
				'nowrap' => _x( 'No Wrap', 'Flex Container Control', 'elementor' ),
				'wrap' => _x( 'Wrap', 'Flex Container Control', 'elementor' ),
				'wrap-reverse' => _x( 'Wrap Reverse', 'Flex Container Control', 'elementor' ),
			],
			'default' => '',
			'selectors' => [
				'{{SELECTOR}}' => '--flex-wrap: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['justify_content'] = [
			'label' => _x( 'Justify Content', 'Flex Container Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => _x( 'Default', 'Flex Container Control', 'elementor' ),
				'center' => _x( 'Center', 'Flex Container Control', 'elementor' ),
				'flex-start' => _x( 'Flex Start', 'Flex Container Control', 'elementor' ),
				'flex-end' => _x( 'Flex End', 'Flex Container Control', 'elementor' ),
				'space-between' => _x( 'Space Between', 'Flex Container Control', 'elementor' ),
				'space-around' => _x( 'Space Around', 'Flex Container Control', 'elementor' ),
				'space-evenly' => _x( 'Space Evenly', 'Flex Container Control', 'elementor' ),
			],
			'selectors' => [
				'{{SELECTOR}}' => '--justify-content: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_items'] = [
			'label' => _x( 'Align Items', 'Flex Container Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => _x( 'Default', 'Flex Container Control', 'elementor' ),
				'center' => _x( 'Center', 'Flex Container Control', 'elementor' ),
				'stretch' => _x( 'Stretch', 'Flex Container Control', 'elementor' ),
				'flex-start' => _x( 'Flex Start', 'Flex Container Control', 'elementor' ),
				'flex-end' => _x( 'Flex End', 'Flex Container Control', 'elementor' ),
			],
			'selectors' => [
				'{{SELECTOR}}' => '--align-items: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_content'] = [
			'label' => _x( 'Align Content', 'Flex Container Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => _x( 'Default', 'Flex Container Control', 'elementor' ),
				'center' => _x( 'Center', 'Flex Container Control', 'elementor' ),
				'flex-start' => _x( 'Flex Start', 'Flex Container Control', 'elementor' ),
				'flex-end' => _x( 'Flex End', 'Flex Container Control', 'elementor' ),
				'space-between' => _x( 'Space Between', 'Flex Container Control', 'elementor' ),
				'space-around' => _x( 'Space Around', 'Flex Container Control', 'elementor' ),
				'space-evenly' => _x( 'Space Evenly', 'Flex Container Control', 'elementor' ),
			],
			'selectors' => [
				'{{SELECTOR}}' => '--align-content: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['gap'] = [
			'label' => _x( 'Gap', 'Flex Item Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 500,
				],
				'%' => [
					'min' => 0,
					'max' => 100,
				],
			],
			'size_units' => [ 'px', '%' ],
			'selectors' => [
				'{{SELECTOR}}' => '--gap: {{SIZE}}{{UNIT}};',
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
