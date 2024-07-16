<?php
namespace Elementor\Modules\FloatingBars\Base;

use Elementor\Modules\FloatingBars\Classes\Render\Floating_Bars_Core_Render;

use Elementor\Group_Control_Typography;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

abstract class Widget_Floating_Bars_Base extends Widget_Base {

	public function get_icon(): string {
		return 'eicon-banner';
	}

	protected function register_controls(): void {
		$this->add_content_tab();

		$this->add_style_tab();

		$this->add_advanced_tab();
	}

	protected function add_announcement_content_section(): void {
		$this->start_controls_section(
			'announcement_content_section',
			[
				'label' => __( 'Announcement', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);
		
		$this->add_control(
			'announcement_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'default' => [
					'value' => 'fas fa-tshirt',
					'library' => 'fa-solid',
				],
				'skin' => 'inline',
				'label_block' => false,
				'icon_exclude_inline_options' => [],
			]
		);

		$this->add_control(
			'announcement_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Enter your text here', 'elementor' ),
				'default' => esc_html__( 'Just in! Cool summer tees', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}

	protected function add_cta_button_content_section(): void {
		$this->start_controls_section(
			'cta_button_content_section',
			[
				'label' => __( 'CTA Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'cta_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Enter text', 'elementor' ),
				'default' => esc_html__( 'Shop now', 'elementor' ),
			],
		);

		$this->add_control(
			'cta_link',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => esc_html__( 'Paste URL or type', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
				'default' => [
					'url' => '',
					'is_external' => true,
					'nofollow' => false,
				],
			]
		);

		$this->add_control(
			'cta_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'icon_exclude_inline_options' => [],
			]
		);

		$this->end_controls_section();
	}

	protected function add_floating_bar_content_section(): void {
		$this->start_controls_section(
			'floating_bar_content_section',
			[
				'label' => __( 'Floating Bar', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'accessible_name',
			[
				'label' => esc_html__( 'Accessible Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Enter text', 'elementor' ),
				'default' => esc_html__( 'Banner', 'elementor' ),
			],
		);

		$this->add_control(
			'floating_bar_close_switch',
			[
				'label' => esc_html__( 'Close Button', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Show', 'elementor' ),
				'label_off' => esc_html__( 'Hide', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->end_controls_section();
	}

	protected function add_announcement_style_section(): void {
		$this->start_controls_section(
			'style_announcement',
			[
				'label' => esc_html__( 'Announcement', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		// TODO: this is visible only if Icon is selected
		$this->add_control(
			'style_announcement_icon_heading',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			]
		);

		$this->add_control(
			'style_announcement_icon_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-floating-bars' => '--e-floating-bars-announcement-icon-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'style_announcement_icon_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'end' => [
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'default' => 'start',
				'toggle' => true,
			]
		);

		$this->add_responsive_control(
			'style_announcement_icon_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 150,
					],
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-floating-bars' => '--e-floating-bars-announcement-icon-size: {{SIZE}}{{UNIT}}',
				],
				'separator' => 'after',
			]
		);

		$this->add_control(
			'style_announcement_text_heading',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_announcement_text_typography',
				'selector' => '{{WRAPPER}} .e-floating-bars__announcement-text',
			]
		);

		$this->add_control(
			'style_announcement_text_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-floating-bars' => '--e-floating-bars-announcement-text-color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function add_cta_button_style_section(): void {

	}

	protected function add_floating_bar_style_section(): void {
		$this->start_controls_section(
			'style_floating_bar',
			[
				'label' => esc_html__( 'Floating Bar', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'style_floating_bar_elements_align',
			[
				'label' => esc_html__( 'Align Elements', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-align-start-h',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-align-center-h',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-align-end-h',
					],
					'stretch' => [
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-align-stretch-h',
					],
				],
				'default' => 'center',
				'toggle' => false,
			]
		);

		$this->add_responsive_control(
			'style_floating_bar_elements_spacing',
			[
				'label' => esc_html__( 'Element spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 40,
					],
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-floating-bars' => '--e-floating-bars-elements-gap: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'style_floating_bar_elements_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem' ],
				'selectors' => [
					'{{WRAPPER}} .e-floating-bars' => '--e-floating-bars-elements-padding-block-end: {{BOTTOM}}{{UNIT}}; --e-floating-bars-elements-padding-block-start: {{TOP}}{{UNIT}}; --e-floating-bars-elements-padding-inline-end: {{RIGHT}}{{UNIT}}; --e-floating-bars-elements-padding-inline-start: {{LEFT}}{{UNIT}};',
				],
			]
		);

		// YOU ARE HERE

		$this->end_controls_section();
	}

	protected function add_content_tab(): void {
		$this->add_announcement_content_section();

		$this->add_cta_button_content_section();

		$this->add_floating_bar_content_section();
	}

	protected function add_style_tab(): void {
		$this->add_announcement_style_section();

		$this->add_cta_button_style_section();

		$this->add_floating_bar_style_section();
	}

	protected function add_advanced_tab(): void {
	}

	protected function render(): void {
		$render_strategy = new Floating_Bars_Core_Render( $this );

		$render_strategy->render();
	}
}