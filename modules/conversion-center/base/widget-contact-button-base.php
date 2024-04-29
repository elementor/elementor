<?php

namespace Elementor\Modules\ConversionCenter\Base;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Modules\ConversionCenter\Classes\Providers\Social_Network_Provider;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Widget_Base;

abstract class Widget_Contact_Button_Base extends Widget_Base {

	const TAB_ADVANCED = 'advanced-tab-contact-buttons';

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

		// Controls
		$this->add_chat_button_section();

		$this->add_top_bar_section();

		$this->add_message_bubble_section();

		$this->add_send_button_section();

		// Styles
		$this->add_style_chat_button_section();

		$this->add_style_top_bar_section();

		$this->add_style_message_bubble_section();

		$this->add_style_send_button_section();

		// Advanced
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
				'default' => Social_Network_Provider::WHATSAPP,
				'options' => Social_Network_Provider::get_social_networks_text(
					[
						Social_Network_Provider::EMAIL,
						Social_Network_Provider::SMS,
						Social_Network_Provider::WHATSAPP,
						Social_Network_Provider::SKYPE,
						Social_Network_Provider::MESSENGER,
						Social_Network_Provider::VIBER,
					]
				),
			]
		);

		$this->add_control(
			'chat_button_mail',
			[
				'label' => esc_html__( 'Email', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '@', 'elementor' ),
				'condition' => [
					'chat_button_platform' => Social_Network_Provider::EMAIL,
				],
			],
		);

		$this->add_control(
			'chat_button_mail_subject',
			[
				'label' => esc_html__( 'Subject', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'chat_button_platform' => Social_Network_Provider::EMAIL,
				],
			],
		);

		$this->add_control(
			'chat_button_mail_body',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'condition' => [
					'chat_button_platform' => Social_Network_Provider::EMAIL,
				],
			]
		);

		$this->add_control(
			'chat_button_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '+', 'elementor' ),
				'condition' => [
					'chat_button_platform' => [
						Social_Network_Provider::SMS,
						Social_Network_Provider::WHATSAPP,
						Social_Network_Provider::VIBER,
					],
				],
			],
		);

		$this->add_control(
			'chat_button_username',
			[
				'label' => esc_html__( 'Username', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'chat_button_platform' => [
						Social_Network_Provider::SKYPE,
						Social_Network_Provider::MESSENGER,
					],
				],
			],
		);

		$this->add_control(
			'chat_button_viber_action',
			[
				'label' => esc_html__( 'Action', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'chat',
				'options' => [
					'chat' => 'Chat',
					'contact' => 'Contact',
				],
				'condition' => [
					'chat_button_platform' => Social_Network_Provider::VIBER,
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

	private function add_top_bar_section(): void {
		$this->start_controls_section(
			'top_bar_section',
			[
				'label' => esc_html__( 'Top Bar', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'top_bar_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob Jones', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Store Manager', 'elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_image',
			[
				'label' => esc_html__( 'Profile Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'top_bar_show_dot',
			[
				'label' => esc_html__( 'Display Active Dot', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_message_bubble_section(): void {
		$this->start_controls_section(
			'message_bubble_section',
			[
				'label' => esc_html__( 'Message Bubble', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'message_bubble_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'message_bubble_body',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'default' => esc_html__( 'Hey, how can I help you today?', 'elementor' ),
				'placeholder' => esc_html__( 'Message', 'elementor' ),
			],
		);

		$this->add_control(
			'chat_button_time_format',
			[
				'label' => esc_html__( 'Time format', 'elementor' ),
				'type'  => Controls_Manager::SELECT,
				'default' => '12h',
				'options' => [
					'12h' => esc_html__( '2:20 PM', 'elementor' ),
					'24h' => esc_html__( '14:20', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'chat_button_show_animation',
			[
				'label' => esc_html__( 'Display Typing Animation', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->end_controls_section();
	}


	private function add_send_button_section(): void {
		$this->start_controls_section(
			'send_button_section',
			[
				'label' => esc_html__( 'Send Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'send_button_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Click to start chat', 'elementor' ),
				'placeholder' => esc_html__( 'Type your text here', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}

	private function add_style_chat_button_section(): void {
		$this->start_controls_section(
			'style_chat_button',
			[
				'label' => esc_html__( 'Chat Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_chat_button_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'medium',
				'options' => [
					'small' => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large' => esc_html__( 'Large', 'elementor' ),
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
				'label' => esc_html__( 'Colors', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_button_color_icon',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-icon: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_button_color_background',
			[
				'label' => esc_html__( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
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
				'label' => esc_html__( 'Colors', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_button_color_icon_hover',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-icon-hover: {{VALUE}}',
				],
				'condition' => [
					'style_button_color_select_hover' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_button_color_background_hover',
			[
				'label' => esc_html__( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
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
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	private function add_style_top_bar_section(): void {

		$this->start_controls_section(
			'style_top_bar_section',
			[
				'label' => esc_html__( 'Top Bar', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_top_bar_profile_heading',
			[
				'label' => esc_html__( 'Profile Image', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'style_top_bar_image_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'medium',
				'options' => [
					'small' => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large' => esc_html__( 'Large', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_top_bar_divider',
			[
				'type' => Controls_Manager::DIVIDER,
			]
		);

		$this->add_control(
			'style_top_bar_colors',
			[
				'label' => esc_html__( 'Colors', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_top_bar_name_heading',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_top_bar_name_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-top-bar-name: {{VALUE}}',
				],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_top_bar_name_typography',
				'selector' => '{{WRAPPER}} .e-contact-buttons__top-bar-name',
			]
		);

		$this->add_control(
			'style_top_bar_title_heading',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_top_bar_title_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-top-bar-title: {{VALUE}}',
				],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_top_bar_title_typography',
				'selector' => '{{WRAPPER}} .e-contact-buttons__top-bar-title',
			]
		);

		$this->add_control(
			'style_top_bar_close_button_color',
			[
				'label' => esc_html__( 'Close Button Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-close-button-color: {{VALUE}}',
				],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_top_bar_background_color',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-top-bar-bg: {{VALUE}}',
				],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_style_message_bubble_section(): void {
		$this->start_controls_section(
			'style_bubble_section',
			[
				'label' => esc_html__( 'Message Bubble', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_bubble_colors',
			[
				'label' => esc_html__( 'Colors', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_bubble_name_heading',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_name_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-message-bubble-name: {{VALUE}}',
				],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_bubble_name_typography',
				'selector' => '{{WRAPPER}} .e-contact-buttons__message-bubble-name',
			]
		);

		$this->add_control(
			'style_bubble_message_heading',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_message_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-message-bubble-body: {{VALUE}}',
				],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_bubble_message_typography',
				'selector' => '{{WRAPPER}} .e-contact-buttons__message-bubble-body',
			]
		);

		$this->add_control(
			'style_bubble_time_heading',
			[
				'label' => esc_html__( 'Time', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_time_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-message-bubble-time: {{VALUE}}',
				],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_bubble_time_typography',
				'selector' => '{{WRAPPER}} .e-contact-buttons__message-bubble-time',
			]
		);

		$this->add_control(
			'style_bubble_background_heading',
			[
				'label' => esc_html__( 'Bubble Background', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_background_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-message-bubble-bubble-bg: {{VALUE}}',
				],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_chat_heading',
			[
				'label' => esc_html__( 'Chat Background', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_chat_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-message-bubble-chat-bg: {{VALUE}}',
				],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_style_send_button_section(): void {
		$this->start_controls_section(
			'style_send_section',
			[
				'label' => esc_html__( 'Send Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs(
			'style_send_tabs'
		);

		$this->start_controls_tab(
			'style_send_tabs_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'style_send_normal_colors',
			[
				'label' => esc_html__( 'Colors', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom'  => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_send_normal_icon_color',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-send-button-icon: {{VALUE}}',
				],
				'condition' => [
					'style_send_normal_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_send_normal_background_color',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-send-button-bg: {{VALUE}}',
				],
				'condition' => [
					'style_send_normal_colors' => 'custom',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'style_send_tabs_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'style_send_hover_colors',
			[
				'label'   => esc_html__( 'Colors', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom'  => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_send_hover_icon_color',
			[
				'label'     => esc_html__( 'Icon Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-send-button-icon-hover: {{VALUE}}',
				],
				'condition' => [
					'style_send_hover_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_send_hover_background_color',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-send-button-bg-hover: {{VALUE}}',
				],
				'condition' => [
					'style_send_hover_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_send_hover_animation',
			[
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tab();

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
				'tab' => static::TAB_ADVANCED,
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
