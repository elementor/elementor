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
					'step' => 1,
				],
			],
			'size_units' => [ 'fr' ],
			'default' => [
				'unit' => 'fr',
				'size' => 3,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)',
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
					'step' => 1,
				],
			],
			'size_units' => [ 'fr' ],
			'default' => [
				'unit' => 'fr',
				'size' => 2,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-rows: repeat({{SIZE}}, 1fr)',
			],
			'responsive' => true,
		];

		$fields['gaps'] = [
			'label' => esc_html__( 'Gaps', 'elementor' ),
			'type' => Controls_Manager::GAPS,
			'size_units' => [ 'px', '%', 'em', 'rem', 'vm', 'custom' ],
			'default' => [
				'unit' => 'px',
			],
			'selectors' => [
				'{{SELECTOR}}' => '--gap: {{ROW}}{{UNIT}} {{COLUMN}}{{UNIT}}',
			],
			'responsive' => true,
		];

		$fields['justify_content'] = [
			'label' => esc_html_x( 'Justify Content', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-start-h',
				],
				'center' => [
					'title' => esc_html_x( 'Middle', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-center-h',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-end-h',
				],
			],
			'selectors' => [
				'{{SELECTOR}}' => '--grid-justify-content: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_content'] = [
			'label' => esc_html_x( 'Align Content', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'label_block' => true,
			'default' => '',
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-start-v',
				],
				'center' => [
					'title' => esc_html_x( 'Middle', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-center-v',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-justify-end-v',
				],
			],
			'selectors' => [
				'{{SELECTOR}}' => '--grid-align-content: {{VALUE}};',
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
