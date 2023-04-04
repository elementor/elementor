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
			'label' => esc_html__( 'Items', 'elementor' ),
			'separator' => 'before',
		];

		$fields['outline'] = [
			'label' => esc_html__( 'Grid Outline', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'label_on' => esc_html__( 'SHOW', 'elementor' ),
			'label_off' => esc_html__( 'HIDE', 'elementor' ),
			'default' => 'yes',
			'frontend_available' => true,
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
			'size_units' => [ 'fr', 'custom' ],
			'unit_selectors_dictionary' => [
				'custom' => '--e-con-grid-template-columns: {{SIZE}}',
			],
			'default' => [
				'unit' => 'fr',
				'size' => 3,
			],
			'mobile_default' => [
				'unit' => 'fr',
				'size' => 1,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)',
			],
			'responsive' => true,
			'frontend_available' => true,
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
			'size_units' => [ 'fr', 'custom' ],
			'unit_selectors_dictionary' => [
				'custom' => '--e-con-grid-template-rows: {{SIZE}}',
			],
			'default' => [
				'unit' => 'fr',
				'size' => 2,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-rows: repeat({{SIZE}}, 1fr)',
			],
			'responsive' => true,
			'frontend_available' => true,
		];

		$fields['gaps'] = [
			'label' => esc_html__( 'Gaps', 'elementor' ),
			'type' => Controls_Manager::GAPS,
			'size_units' => [ 'px', '%', 'em', 'rem', 'vm', 'custom' ],
			'default' => [
				'unit' => 'px',
			],
			'separator' => 'before',
			'selectors' => [
				'{{SELECTOR}}' => '--gap: {{ROW}}{{UNIT}} {{COLUMN}}{{UNIT}}',
			],
			'responsive' => true,
		];

		$fields['auto_flow'] = [
			'label' => esc_html__( 'Auto Flow', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'row' => esc_html__( 'Row', 'elementor' ),
				'column' => esc_html__( 'Column', 'elementor' ),
			],
			'default' => 'row',
			'separator' => 'before',
			'selectors' => [
				'{{SELECTOR}}' => '--grid-auto-flow: {{VALUE}}',
			],
		];

		$fields['justify_items'] = [
			'label' => esc_html_x( 'Justify Items', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-v',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-center-v',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-v',
				],
				'stretch' => [
					'title' => esc_html_x( 'Stretch', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-stretch-v',
				],
			],
			'default' => '',
			'selectors' => [
				'{{SELECTOR}}' => '--justify-items: {{VALUE}};',
			],
			'responsive' => true,
		];

		$fields['align_items'] = [
			'label' => esc_html_x( 'Align Items', 'Grid Container Control', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html_x( 'Start', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-h',
				],
				'center' => [
					'title' => esc_html_x( 'Center', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-center-h',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-h',
				],
				'stretch' => [
					'title' => esc_html_x( 'Stretch', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-stretch-h',
				],
			],
			'selectors' => [
				'{{SELECTOR}}' => '--align-items: {{VALUE}};',
			],
			'separator' => 'after',
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
					'icon' => 'eicon-justify-start-h',
				],
				'center' => [
					'title' => esc_html_x( 'Middle', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-center-h',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-end-h',
				],
				'space-between' => [
					'title' => esc_html_x( 'Space Between', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-between-h',
				],
				'space-around' => [
					'title' => esc_html_x( 'Space Around', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-around-h',
				],
				'space-evenly' => [
					'title' => esc_html_x( 'Space Evenly', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-evenly-h',
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
					'icon' => 'eicon-justify-start-v',
				],
				'center' => [
					'title' => esc_html_x( 'Middle', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-center-v',
				],
				'end' => [
					'title' => esc_html_x( 'End', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-end-v',
				],
				'space-between' => [
					'title' => esc_html_x( 'Space Between', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-between-v',
				],
				'space-around' => [
					'title' => esc_html_x( 'Space Around', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-around-v',
				],
				'space-evenly' => [
					'title' => esc_html_x( 'Space Evenly', 'Grid Container Control', 'elementor' ),
					'icon' => 'eicon-justify-space-evenly-v',
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
