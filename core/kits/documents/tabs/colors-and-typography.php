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

	const TYPOGRAPHY_GROUP_PREFIX = 'typography';

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

		$repeater->add_control(
			'color',
			[
				'type' => Controls_Manager::COLOR,
				'label_block' => true,
				'dynamic' => [],
				'selectors' => [
					'{{WRAPPER}}' => '--e-global-color-{{_id.VALUE}}: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'system_colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'title' => __( 'Primary', 'elementor' ),
						'color' => '#6ec1e4',
					],
					[
						'title' => __( 'Secondary', 'elementor' ),
						'color' => '#54595f',
					],
					[
						'title' => __( 'Text', 'elementor' ),
						'color' => '#7a7a7a',
					],
					[
						'title' => __( 'Accent', 'elementor' ),
						'color' => '#61ce70',
					],
				],
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
				'name' => self::TYPOGRAPHY_GROUP_PREFIX,
				'label' => '',
				'fields_options' => [
					'font_family' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-font-family: "{{VALUE}}"',
						],
					],
					'font_size' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-font-size: {{SIZE}}{{UNIT}}',
						],
					],
					'font_weight' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-font-weight: {{VALUE}}',
						],
					],
					'text_transform' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-text-transform: {{VALUE}}',
						],
					],
					'font_style' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-font-style: {{VALUE}}',
						],
					],
					'text_decoration' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-text-decoration: {{VALUE}}',
						],
					],
					'line_height' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-line-height: {{SIZE}}{{UNIT}}',
						],
					],
					'letter_spacing' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-style-{{external._id.VALUE}}-letter-spacing: {{SIZE}}{{UNIT}}',
						],
					],
				],
			]
		);

		$font_family_key = self::TYPOGRAPHY_GROUP_PREFIX . '_font_family';

		$font_weight_key = self::TYPOGRAPHY_GROUP_PREFIX . '_font_weight';

		$this->add_control(
			'system_typography',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'title' => __( 'Primary', 'elementor' ),
						$font_family_key => 'Roboto',
						$font_weight_key => '600',
					],
					[
						'title' => __( 'Secondary', 'elementor' ),
						$font_family_key => 'Roboto Slab',
						$font_weight_key => '400',
					],
					[
						'title' => __( 'Text', 'elementor' ),
						$font_family_key => 'Roboto',
						$font_weight_key => '400',
					],
					[
						'title' => __( 'Accent', 'elementor' ),
						$font_family_key => 'Roboto',
						$font_weight_key => '500',
					],
				],
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
