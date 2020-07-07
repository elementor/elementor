<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Plugin;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Colors_And_Typography extends Tab_Base {

	const COLOR_PRIMARY = 'globals/colors?id=primary';
	const COLOR_SECONDARY = 'globals/colors?id=secondary';
	const COLOR_TEXT = 'globals/colors?id=text';
	const COLOR_ACCENT = 'globals/colors?id=accent';

	const TYPOGRAPHY_PRIMARY = 'globals/typography?id=primary';
	const TYPOGRAPHY_SECONDARY = 'globals/typography?id=secondary';
	const TYPOGRAPHY_TEXT = 'globals/typography?id=text';
	const TYPOGRAPHY_ACCENT = 'globals/typography?id=accent';

	const TYPOGRAPHY_NAME = 'typography';
	const TYPOGRAPHY_GROUP_PREFIX = self::TYPOGRAPHY_NAME . '_';

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

		$default_colors = [];

		if ( Plugin::$instance->kits_manager->is_custom_colors_enabled() ) {
			$default_colors = [
				[
					'_id' => 'primary',
					'title' => __( 'Primary', 'elementor' ),
					'color' => '#6ec1e4',
				],
				[
					'_id' => 'secondary',
					'title' => __( 'Secondary', 'elementor' ),
					'color' => '#54595f',
				],
				[
					'_id' => 'text',
					'title' => __( 'Text', 'elementor' ),
					'color' => '#7a7a7a',
				],
				[
					'_id' => 'accent',
					'title' => __( 'Accent', 'elementor' ),
					'color' => '#61ce70',
				],
			];
		}

		$this->add_control(
			'system_colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => $default_colors,
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
				'name' => self::TYPOGRAPHY_NAME,
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

		$default_typography = [];

		if ( Plugin::$instance->kits_manager->is_custom_typography_enabled() ) {

			$typography_key = self::TYPOGRAPHY_GROUP_PREFIX . 'typography';
			$font_family_key = self::TYPOGRAPHY_GROUP_PREFIX . 'font_family';
			$font_weight_key = self::TYPOGRAPHY_GROUP_PREFIX . 'font_weight';

			$default_typography = [
				[
					'_id' => 'primary',
					'title' => __( 'Primary', 'elementor' ),
					$typography_key => 'custom',
					$font_family_key => 'Roboto',
					$font_weight_key => '600',
				],
				[
					'_id' => 'secondary',
					'title' => __( 'Secondary', 'elementor' ),
					$typography_key => 'custom',
					$font_family_key => 'Roboto Slab',
					$font_weight_key => '400',
				],
				[
					'_id' => 'text',
					'title' => __( 'Text', 'elementor' ),
					$typography_key => 'custom',
					$font_family_key => 'Roboto',
					$font_weight_key => '400',
				],
				[
					'_id' => 'accent',
					'title' => __( 'Accent', 'elementor' ),
					$typography_key => 'custom',
					$font_family_key => 'Roboto',
					$font_weight_key => '500',
				],
			];
		}

		$this->add_control(
			'system_typography',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => $default_typography,
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
