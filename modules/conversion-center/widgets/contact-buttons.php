<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Controls_Manager;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Group_Control_Typography;
use Elementor\Widget_Base;
use Elementor\Utils;

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

		$this->add_top_bar_section();
		
		$this->add_message_bubble_section();
		
		$this->add_send_button_section();

		$this->add_style_chat_button_section();

		$this->add_style_top_bar_section();

		$this->add_style_message_bubble_section();

		$this->add_style_send_button_section();

		$this->add_style_chat_box_section();

		// Advanced tab
	}

	private function add_chat_button_section(): void {
		$this->start_controls_section(
			'chat_button_section',
			[
				'label' => esc_html__( 'Chat Button', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'chat_button_platform',
			[
				'label'     => esc_html__( 'Platform', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'whatsapp',
				'options'   => [
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
				'label'        => esc_html__( 'Display Notification Dot', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_top_bar_section(): void {
		$this->start_controls_section(
			'top_bar_section',
			[
				'label' => esc_html__( 'Top Bar', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'top_bar_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob Jones', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Store Manager', 'elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_image',
			[
				'label'   => esc_html__( 'Profile Image', 'elementor' ),
				'type'    => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'top_bar_show_dot',
			[
				'label'        => esc_html__( 'Display Active Dot', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();

	}

	private function add_message_bubble_section(): void {
		$this->start_controls_section(
			'message_bubble_section',
			[
				'label' => esc_html__( 'Message Bubble', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'message_bubble_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'message_bubble_body',
			[
				'label'       => esc_html__( 'Message', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'dynamic'     => [
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
				'label'     => esc_html__( 'Time format', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'whatsapp',
				'options'   => [
					// TODO: this needs to be dynamic from user end
					'12h' => esc_html__( '2:20pm', 'elementor' ),
					'24h' => esc_html__( '14:20', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'chat_button_show_animation',
			[
				'label'        => esc_html__( 'Display Typing Animation', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_send_button_section(): void {
		$this->start_controls_section(
			'send_button_section',
			[
				'label' => esc_html__( 'Send Button', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'send_button_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Click to start chat', 'elementor' ),
				'placeholder' => esc_html__( 'Type your text here', 'elementor' ),
			]
		);

		$this->add_control(
			'send_button_whatsapp_number',
			[
				'label'       => esc_html__( 'Account phone number', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '+', 'elementor' ),
				'condition'   => [
					'chat_button_platform' => 'whatsapp'
				],
			],
		);

		$this->add_control(
			'send_button_skype_username',
			[
				'label'       => esc_html__( 'Username', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'condition'   => [
					'chat_button_platform' => 'skype'
				],
			],
		);

		$this->add_control(
			'send_button_url',
			[
				'label' => esc_html__( 'Link', 'textdomain' ),
				'type' => Controls_Manager::URL,
				'options' => [ 'url', 'is_external' ],
				'default' => [
					'url' => '',
					'is_external' => true,
				],
				'label_block' => true,
				'condition'   => [
					'chat_button_platform' => 'url'
				],
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
				'label' => esc_html__( 'Normal', 'textdomain' ),
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_button_color_select' => 'custom',
				],
			]
		);
		
		$this->end_controls_tab();

		$this->start_controls_tab(
			'style_button_color_tabs_hover',
			[
				'label' => esc_html__( 'Hover', 'textdomain' ),
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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

	private function add_style_top_bar_section(): void {

		$this->start_controls_section(
			'style_top_bar_section',
			[
				'label' => esc_html__( 'Top Bar', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_top_bar_profile_heading',
			[
				'label'     => esc_html__( 'Profile Image', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'style_top_bar_image_size',
			[
				'label'   => esc_html__( 'Size', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => '75',
				'options' => [
					'65'  => esc_html__( 'Small', 'elementor' ),
					'75' => esc_html__( 'Medium', 'elementor' ),
					'85'  => esc_html__( 'Large', 'elementor' ),
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
			'style_top_bar_name_heading',
			[
				'label'     => esc_html__( 'Name', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_top_bar_name_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'style_top_bar_name_typography',
				// TODO: add correct selector
				// 'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'style_top_bar_title_heading',
			[
				'label'     => esc_html__( 'Title', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_top_bar_title_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'style_top_bar_title_typography',
				// TODO: add correct selector
				// 'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'style_top_bar_close_button_color',
			[
				'label'     => esc_html__( 'Close Button Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_top_bar_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_top_bar_background_color',
			[
				'label'     => esc_html__( 'Background', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_bubble_colors',
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
			'style_bubble_name_heading',
			[
				'label'     => esc_html__( 'Name', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_name_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'style_bubble_name_typography',
				// TODO: add correct selector
				// 'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'style_bubble_message_heading',
			[
				'label'     => esc_html__( 'Message', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_message_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'style_bubble_message_typography',
				// TODO: add correct selector
				// 'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'style_bubble_time_heading',
			[
				'label'     => esc_html__( 'Time', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
			]
		);

		$this->add_control(
			'style_bubble_time_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'style_bubble_time_typography',
				// TODO: add correct selector
				// 'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'style_bubble_background_heading',
			[
				'label'     => esc_html__( 'Bubble Background', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_background_color',
			[
				'label'     => esc_html__( 'Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_chat_heading',
			[
				'label'     => esc_html__( 'Chat Background', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => false,
				'condition' => [
					'style_bubble_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_bubble_chat_color',
			[
				'label'     => esc_html__( 'Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs(
			'style_send_tabs'
		);

		$this->start_controls_tab(
			'style_send_tabs_normal',
			[
				'label' => esc_html__( 'Normal', 'textdomain' ),
			]
		);

		$this->add_control(
			'style_send_normal_colors',
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
			'style_send_normal_icon_color',
			[
				'label'     => esc_html__( 'Icon Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_send_normal_colors' => 'custom',
				],
			]
		);

		// TODO: check if this is in the right place
		$this->add_control(
			'style_send_normal_animation',
			[
				'label'   => esc_html__( 'Hover Animation', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'grow',
				'options' => [
					'none'  => esc_html__( 'None', 'elementor' ),
					'grow'  => esc_html__( 'Grow', 'elementor' ),
					'pulse' => esc_html__( 'Pulse', 'elementor' ),
					'push'  => esc_html__( 'Push', 'elementor' ),
					'float' => esc_html__( 'Float', 'elementor' ),
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
				'label' => esc_html__( 'Hover', 'textdomain' ),
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
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
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_send_hover_colors' => 'custom',
				],
			]
		);

		$this->add_control(
			'style_send_hover_animation',
			[
				'label'   => esc_html__( 'Hover Animation', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'grow',
				'options' => [
					'none'  => esc_html__( 'None', 'elementor' ),
					'grow'  => esc_html__( 'Grow', 'elementor' ),
					'pulse' => esc_html__( 'Pulse', 'elementor' ),
					'push'  => esc_html__( 'Push', 'elementor' ),
					'float' => esc_html__( 'Float', 'elementor' ),
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tab();

		$this->end_controls_section();
	}

	private function add_style_chat_box_section(): void {
		$this->start_controls_section(
			'style_chat_box_section',
			[
				'label' => esc_html__( 'Chat Box', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_chat_box_bg_select',
			[
				'label'   => esc_html__( 'Background Color', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => esc_html__( 'Default', 'elementor' ),
					'custom'  => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_chat_box_bg_color',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				// ],
				'condition' => [
					'style_chat_box_bg_select' => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'style_chat_box_width',
			[
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw' ],
				'range' => [
					'px' => [
						'max' => 0,
						'min' => 400,
						'step' => 1,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 50,
				],
				'mobile_default' => [
					'unit' => 'vw',
					'size' => 100,
				],
				// TODO: add correct selectors
				// 'selectors' => [
				// 	'{{WRAPPER}} .e-link-in-bio__bg-overlay' => '--background-overlay-opacity: {{SIZE}};',
				// ],
			]
		);

		$this->add_control(
			'style_chat_box_corners',
			[
				'label'     => esc_html__( 'Corners', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'rounded',
				'options'   => [
					'round'   => esc_html__( 'Round', 'elementor' ), // 50px
					'rounded' => esc_html__( 'Rounded', 'elementor' ), // 20px
					'sharp'   => esc_html__( 'Sharp', 'elementor' ), // 0
				],
			]
		);

		// TODO: check if this is correct
		$this->add_control(
			'style_chat_box_box_shadow',
			[
				'label' => esc_html__( 'Box Shadow', 'elementor' ),
				'type' => \Elementor\Controls_Manager::POPOVER_TOGGLE,
				'label_off' => esc_html__( 'Default', 'elementor' ),
				'label_on' => esc_html__( 'Custom', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
			]
		);

		$this->add_control(
			'style_chat_box_entrance_animation',
			[
				'label'     => esc_html__( 'Entrance Animation', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'slide-in-up',
				'options'   => [
					'none'          => esc_html__( 'None', 'elementor' ),
					'fade-in-up'    => esc_html__( 'Fade In Up', 'elementor' ),
					'zoom-in-up'    => esc_html__( 'Zoom In Up', 'elementor' ),
					'slide-in-up'   => esc_html__( 'Slide In Up', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_chat_box_exit_animation',
			[
				'label'     => esc_html__( 'Exit Animation', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'slide-out-down',
				'options'   => [
					'none'             => esc_html__( 'None', 'elementor' ),
					'fade-out-down'    => esc_html__( 'Fade Out Down', 'elementor' ),
					'zoom-out-down'    => esc_html__( 'Zoom Out Down', 'elementor' ),
					'slide-out-down'   => esc_html__( 'Slide Out Down', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'style_chat_box_animation_duration',
			[
				'label'     => esc_html__( 'Animation Duration', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'normal',
				'options'   => [
					'slow'    => esc_html__( 'Slow', 'elementor' ),
					'normal'  => esc_html__( 'Normal', 'elementor' ),
					'fast'    => esc_html__( 'Fast', 'elementor' ),
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render(): void {
		$render_strategy = new Contact_Buttons_Core_Render( $this );

		$render_strategy->render();
	}

}