<?php

namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Typography;
use Elementor\Utils;

/**
 * Elementor e-heading web component.
 *
 * Elementor web component that displays a heading element.
 *
 * @since 3.4.0
 */
class Widget_E_Heading extends Web_Component_Base {
	/**
	 * Get component name.
	 *
	 * Retrieve e-heading component name.
	 *
	 * @since 3.4.0
	 * @access public
	 *
	 * @return string Web_Component name.
	 */
	public function get_name() {
		return 'e-heading';
	}

	public function get_title() {
		return __( 'E Heading', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-t-letter';
	}

	public function get_keywords() {
		return [ 'heading', 'title', 'text', 'web component', 'component', 'h1', 'h2', 'typography' ];
	}

	public function get_script_depends() {
		return [ 'ewc-basic' ];
	}

	/**
	 * Register heading widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_title',
			[
				'label' => __( 'Title', 'elementor' ),
			]
		);

		$this->add_control(
			'main_content',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => __( 'Enter your title', 'elementor' ),
				'default' => __( 'Add Your Heading Text Here', 'elementor' ),
				'render_type' => 'ui',
				'component_slot' => 'default',
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => [
					'active' => true,
				],
				'default' => [
					'url' => '',
				],
				'separator' => 'before',
				'render_type' => 'none',
			]
		);

		$this->add_control(
			'size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => __( 'Default', 'elementor' ),
					's' => __( 'Small', 'elementor' ),
					'm' => __( 'Medium', 'elementor' ),
					'l' => __( 'Large', 'elementor' ),
					'xl' => __( 'XL', 'elementor' ),
					'xxl' => __( 'XXL', 'elementor' ),
				],
				'component_prop' => 'default',
				'render_type' => 'ui',
			]
		);

		$this->add_control(
			'level',
			[
				'label' => __( 'HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'1' => 'H1',
					'2' => 'H2',
					'3' => 'H3',
					'4' => 'H4',
					'5' => 'H5',
					'6' => 'H6',
				],
				'default' => '2',
				'component_prop' => 'default',
				'render_type' => 'ui',
			]
		);

		$this->add_responsive_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					],
				],
				'component_prop' => 'default',
				'render_type' => 'ui',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title_style',
			[
				'label' => __( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'primary' => __( 'Primary', 'elementor' ),
					'secondary' => __( 'Secondary', 'elementor' ),
					'cta' => __( 'CTA', 'elementor' ),
					'success' => __( 'Success', 'elementor' ),
					'warning' => __( 'Warning', 'elementor' ),
					'error' => __( 'Error', 'elementor' ),
					'info' => __( 'Info', 'elementor' ),
					'green' => __( 'Green', 'elementor' ),
					'celery' => __( 'Celery', 'elementor' ),
					'blue' => __( 'Blue', 'elementor' ),
					'purple' => __( 'Purple', 'elementor' ),
					'indigo' => __( 'Indigo', 'elementor' ),
					'magenta' => __( 'Magenta', 'elementor' ),
					'red' => __( 'Red', 'elementor' ),
					'orange' => __( 'Orange', 'elementor' ),
					'yellow' => __( 'Yellow', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
				'component_prop' => 'default',
				'render_type' => 'ui',
			]
		);

		$this->add_control(
			'custom_color',
			[
				'label' => __( 'Custom Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'condition' => [ 'color' => 'custom' ],
				'selectors' => [ '{{WRAPPER}}' => '--ewc-heading-color: {{VALUE}}' ],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector' => '{{WRAPPER}}',
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'text_shadow',
				'selector' => '{{WRAPPER}}',
			]
		);

		$this->add_control(
			'blend_mode',
			[
				'label' => __( 'Blend Mode', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'Normal', 'elementor' ),
					'multiply' => 'Multiply',
					'screen' => 'Screen',
					'overlay' => 'Overlay',
					'darken' => 'Darken',
					'lighten' => 'Lighten',
					'color-dodge' => 'Color Dodge',
					'saturation' => 'Saturation',
					'color' => 'Color',
					'difference' => 'Difference',
					'exclusion' => 'Exclusion',
					'hue' => 'Hue',
					'luminosity' => 'Luminosity',
				],
				'selectors' => [
					'{{WRAPPER}} e-heading' => 'mix-blend-mode: {{VALUE}}',
				],
				'separator' => 'none',
			]
		);

		$this->end_controls_section();
	}

	protected function register_slots() {
		$settings = $this->get_settings_for_display();

		$this->add_slot( 'default', [
			'content' => $this->render_anchor_tag( 'link', $settings['link'], $settings['main_content'] ),
			'node_type' => 'none',
		] );
	}
}
