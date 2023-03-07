<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Grid_Container extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'grid-container';
	}

	protected function init_fields() {
		$fields = [];

		$fields['items_grid'] = [
			'type' => Controls_Manager::HEADING,
			'label' => esc_html__( 'Grid Items', 'elementor' ),
			'separator' => 'before',
		];

		$fields['columns_grid'] = [
			'label' => esc_html__( 'Columns', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'fr' => [
					'min' => 1,
					'max' => 12,
				],
			],
			'size_units' => [ 'fr', 'px', '%', 'vw', 'custom' ],
			'default' => [
				'unit' => 'fr',
				'size' => 3,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)'
			],
			'responsive' => true,
		];

		$fields['rows_grid'] = [
			'label' => esc_html__( 'Rows', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'fr' => [
					'min' => 1,
					'max' => 12,
				],
			],
			'size_units' => [ 'fr', 'px', '%', 'vw', 'custom' ],
			'default' => [
				'unit' => 'fr',
				'size' => 2,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-rows: repeat({{SIZE}}, 1fr)'
			],
			'responsive' => true,
		];

		$fields['gap_grid'] = [
			'label' => esc_html_x( 'Gap between elements', 'Grid Item Control', 'elementor' ),
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
				'vw' => [
					'min' => 0,
					'max' => 100,
				],
				'em' => [
					'min' => 0,
					'max' => 50,
				],
			],
			'size_units' => [ 'px', '%', 'vw', 'em', 'rem', 'custom' ],
			'selectors' => [
				'{{SELECTOR}}' => '--gap: {{SIZE}}{{UNIT}};',
			],
			'responsive' => true,
		];

		$fields['justify_items_grid'] = [
			'label' => esc_html_x( 'Justify Items', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'default' => '',
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-start-h',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-center-h',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-end-h',
				],
				'stretch' => [
					'title' => esc_html_x( 'Stretch', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-stretch-h',
				],
			],
			'selectors' => [
				'{{SELECTOR}}' => '--justify-items: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_items_grid'] = [
			'label' => esc_html_x( 'Align Items', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'stretch' => [
					'title' => esc_html_x( 'Stretch', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-stretch-v',
				],
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-start-v',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-end-v',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-align-center-v',
				],
				'baseline' => [
					'title' => esc_html_x( 'Baseline', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-v-align-top',
				],
			],
			'selectors' => [
				'{{SELECTOR}}' => '--align-items: {{VALUE}};',
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
