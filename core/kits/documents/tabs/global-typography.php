<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Core\Kits\Documents\Tabs\Typography\Default_Typography_Type;
use Elementor\Core\Kits\Documents\Tabs\Typography\Typography_Default_Configuration_Builder;
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
		return esc_html__( 'Global Fonts', 'elementor' );
	}

	public function get_group() {
		return 'global';
	}

	public function get_icon() {
		return 'eicon-t-letter';
	}

	public function get_help_url() {
		return 'https://go.elementor.com/global-fonts';
	}

	protected function register_tab_controls() {
		$this->start_controls_section(
			'section_text_style',
			[
				'label' => esc_html__( 'Global Fonts', 'elementor' ),
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
						'responsive' => true,
					],
					'font_size' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-size: {{SIZE}}{{UNIT}}',
						],
						'responsive' => true,
					],
					'font_weight' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-weight: {{VALUE}}',
						],
						'responsive' => true,
					],
					'text_transform' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-text-transform: {{VALUE}}',
						],
						'responsive' => true,
					],
					'font_style' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-font-style: {{VALUE}}',
						],
						'responsive' => true,
					],
					'text_decoration' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-text-decoration: {{VALUE}}',
						],
						'responsive' => true,
					],
					'line_height' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-line-height: {{SIZE}}{{UNIT}}',
						],
						'responsive' => true,
					],
					'letter_spacing' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-letter-spacing: {{SIZE}}{{UNIT}}',
						],
						'responsive' => true,
					],
					'word_spacing' => [
						'selectors' => [
							'{{SELECTOR}}' => '--e-global-typography-{{external._id.VALUE}}-word-spacing: {{SIZE}}{{UNIT}}',
						],
						'responsive' => true,
					],
				],
			]
		);

		$this->add_control(
			'heading_system_typography',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'System Fonts', 'elementor' ),
			]
		);

		$default_configuration_builder = new Typography_Default_Configuration_Builder();
		$default_typography = [
			$default_configuration_builder->build_typography( Default_Typography_Type::PRIMARY ),
			$default_configuration_builder->build_typography( Default_Typography_Type::SECONDARY ),
			$default_configuration_builder->build_typography( Default_Typography_Type::TEXT ),
			$default_configuration_builder->build_typography( Default_Typography_Type::ACCENT ),
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
				'separator' => 'after',
			]
		);

		$this->add_control(
			'heading_custom_typography',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Custom Fonts', 'elementor' ),
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
				'label' => esc_html__( 'Fallback Font Family', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => 'Sans-serif',
				'description' => esc_html__( 'The list of fonts used if the chosen font is not available.', 'elementor' ),
				'label_block' => true,
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}
}
