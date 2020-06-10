<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Colors_And_Typography extends Tab_Base {

	public function get_id() {
		return 'colors-and-typography';
	}

	public function get_title() {
		return __( 'Colors & Typography', 'elementor' );
	}

	public function register_tab_controls() {
		$this->start_controls_section(
			'section_global_colors',
			[
				'label' => __( 'Global Colors', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
			]
		);

		// Color Value
		$repeater->add_control(
			'value',
			[
				'type' => Controls_Manager::COLOR,
				'label_block' => true,
				'dynamic' => [],
				'selectors' => [
					'{{WRAPPER}}' => '--e-global-color-{{_id.VALUE}}: {{VALUE}}',
				],
				'global' => [
					'active' => false,
				],
			]
		);

		$this->add_control(
			'system_colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'item_actions' => [
					'add' => false,
					'remove' => false,
				],
			]
		);

		$this->add_control(
			'custom_colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_text_style',
			[
				'label' => __( 'Global Text Styles', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
			]
		);

		$repeater->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'styles',
				'label' => '',
				'global' => [
					'active' => false,
				],
				'fields_options' => [
					'font_family' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-family: "{{VALUE}}"',
						],
					],
					'font_size' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-size: {{SIZE}}{{UNIT}}',
						],
					],
					'font_weight' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-weight: {{VALUE}}',
						],
					],
					'text_transform' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-text-transform: {{VALUE}}',
						],
					],
					'font_style' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-style: {{VALUE}}',
						],
					],
					'text_decoration' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-text-decoration: {{VALUE}}',
						],
					],
					'line_height' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-line-height: {{SIZE}}{{UNIT}}',
						],
					],
					'letter_spacing' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-letter-spacing: {{SIZE}}{{UNIT}}',
						],
					],
				],
			]
		);

		$this->add_control(
			'system_typography',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'item_actions' => [
					'add' => false,
					'remove' => false,
				],
			]
		);

		$this->add_control(
			'custom_typography',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
			]
		);

		$this->end_controls_section();
	}
}
