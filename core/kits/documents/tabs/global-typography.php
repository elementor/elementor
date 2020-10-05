<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Global_Typography extends Tab_Base {

	const TYPOGRAPHY_PRIMARY = 'globals/typography?id=primary';
	const TYPOGRAPHY_SECONDARY = 'globals/typography?id=secondary';
	const TYPOGRAPHY_TEXT = 'globals/typography?id=text';
	const TYPOGRAPHY_ACCENT = 'globals/typography?id=accent';

	const TYPOGRAPHY_NAME = 'typography';
	const TYPOGRAPHY_GROUP_PREFIX = self::TYPOGRAPHY_NAME . '_';

	public function get_id() {
		return 'global-typography';
	}

	public function get_title() {
		return __( 'Global Fonts', 'elementor' );
	}

	protected function register_tab_controls() {
		$this->start_controls_section(
			'section_text_style',
			[
				'label' => __( 'Global Fonts', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'required' => true,
			]
		);

		$repeater->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => self::TYPOGRAPHY_NAME,
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

		$this->add_control(
			'default_generic_fonts',
			[
				'label' => __( 'Fallback Font Family', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Sans-serif',
				'description' => __( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
				'label_block' => true,
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}
}
