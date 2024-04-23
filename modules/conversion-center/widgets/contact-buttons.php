<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Controls_Manager;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Group_Control_Typography;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Contact Buttons widget.
 *
 * TODO: add description
 *
 * @since 3.23.0
 */
class Contact_Buttons extends Widget_Base {
	const TAB_ADVANCED = 'advanced-tab-contact-buttons';

    public function get_name(): string {
		return 'contact-buttons';
	}

	public function get_title(): string {
		return esc_html__( 'Contact Buttons', 'elementor' );
	}

	public function get_icon(): string {
		return 'eicon-commenting-o';
	}

	public function get_categories(): array {
		return [ 'general' ];
	}

	public function get_keywords(): array {
		return [ 'buttons', 'contact', 'widget' ];
	}

	public function get_stack( $with_common_controls = true ): array {
		return parent::get_stack( false );
	}

	protected function register_controls(): void {
		$this->add_chat_button_section();

		$this->add_style_chat_button_section();

		$this->add_advanced_tab();
	}

	private function add_chat_button_section(): void {
		$this->start_controls_section(
			'chat_button_section',
			[
				'label' => esc_html__( 'Chat Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'chat_button_platform',
			[
				'label' => esc_html__( 'Platform', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'whatsapp',
				'options' => [
					'email' => esc_html__( 'Email', 'elementor' ),
					'sms' => esc_html__( 'SMS', 'elementor' ),
					'whatsapp' => esc_html__( 'Whatsapp', 'elementor' ),
					'skype' => esc_html__( 'Skype', 'elementor' ),
					'messenger' => esc_html__( 'Messenger', 'elementor' ),
					'viber' => esc_html__( 'Viber', 'elementor' ),
					'url' => esc_html__( 'Url', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'chat_button_show_dot',
			[
				'label' => esc_html__( 'Display Notification Dot', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_style_chat_button_section(): void {
		$this->start_controls_section(
			'style_chat_button',
			[
				'label' => esc_html__( 'Chat Button', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_chat_button_size',
			[
				'label'      => esc_html__( 'Size', 'elementor' ),
				'type'       => Controls_Manager::SELECT,
				'default'    => 'medium',
				'options'    => [
					'small'  => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large'  => esc_html__( 'Large', 'elementor' ),
				],
			]
		);

		$this->start_controls_tabs(
			'style_button_color_tabs'
		);

		$this->start_controls_tab(
			'style_button_color_tabs_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'style_button_color_select',
			[
				'label'        => esc_html__( 'Colors', 'elementor' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'default',
				'options'      => [
					'default'  => esc_html__( 'Default', 'elementor' ),
					'custom'   => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_button_color_icon',
			[
				'label'     => esc_html__( 'Icon Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-text: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_button_color_background',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-bg: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select' => 'custom',
				],
			]
		);
		
		$this->end_controls_tab();

		$this->start_controls_tab(
			'style_button_color_tabs_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'style_button_color_select_hover',
			[
				'label'        => esc_html__( 'Colors', 'elementor' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'default',
				'options'      => [
					'default'  => esc_html__( 'Default', 'elementor' ),
					'custom'   => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_button_color_icon_hover',
			[
				'label'     => esc_html__( 'Icon Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-text-hover: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select_hover' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_button_color_background_hover',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-bg-hover: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select_hover' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_button_color_hover_animation',
			[
				'label'        => esc_html__( 'Hover Animation', 'elementor' ),
				'type'         => Controls_Manager::SELECT,
				'default'      => 'grow',
				'options'      => [
					'none'  => esc_html__( 'None', 'elementor' ),
					'grow'  => esc_html__( 'Grow', 'elementor' ),
					'pulse' => esc_html__( 'Pulse', 'elementor' ),
					'push'  => esc_html__( 'Push', 'elementor' ),
					'float' => esc_html__( 'Float', 'elementor' ),
				],
			]
		);
		
		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}


	private function add_advanced_tab(): void {
		Controls_Manager::add_tab(
			static::TAB_ADVANCED,
			esc_html__( 'Advanced', 'elementor' )
		);


		$this->start_controls_section(
			'advanced_custom_controls_section',
			[
				'label' => esc_html__( 'Custom', 'elementor' ),
				'tab'   => static::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'advanced_custom_css_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'ai' => [
					'active' => false,
				],
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
			]
		);

		$this->add_control(
			'advanced_custom_css_classes',
			[
				'label' => esc_html__( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'ai' => [
					'active' => false,
				],
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
			]
		);

		$this->end_controls_section();

		Plugin::$instance->controls_manager->add_custom_css_controls( $this, static::TAB_ADVANCED );

		Plugin::$instance->controls_manager->add_custom_attributes_controls( $this, static::TAB_ADVANCED );

	}

	protected function render(): void {
		$render_strategy = new Contact_Buttons_Core_Render( $this );

		$render_strategy->render();
	}

}