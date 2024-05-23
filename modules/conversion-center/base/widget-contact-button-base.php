<?php

namespace Elementor\Modules\ConversionCenter\Base;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Modules\ConversionCenter\Classes\Providers\Social_Network_Provider;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Widget_Base;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Repeater;

abstract class Widget_Contact_Button_Base extends Widget_Base {

	const TAB_ADVANCED = 'advanced-tab-contact-buttons';

	public static function get_configuration() {
		return [
			'content' => [
				'chat_button_section' => [
					'section_name' => esc_html__( 'Chat Button', 'elementor' ),
					'has_platform' => true,
					'has_icon' => false,
					'icon_default' => [
						'value' => 'far fa-comment-dots',
						'library' => 'fa-regular',
					],
					'has_notification_dot' => true,
					'has_active_tab' => false,
					'platform' => [
						'group' => [
							Social_Network_Provider::EMAIL,
							Social_Network_Provider::SMS,
							Social_Network_Provider::WHATSAPP,
							Social_Network_Provider::SKYPE,
							Social_Network_Provider::MESSENGER,
							Social_Network_Provider::VIBER,
						],
					],
				],
				'message_bubble_section' => [
					'has_typing_animation' => true,
				],
				'contact_section' => [
					'has_tooltip' => false,
					'has_cta_text' => true,
					'icon_text_label' => esc_html__( 'Text', 'elementor' ),
					'platform' => [
						'group-1' => [
							Social_Network_Provider::EMAIL,
							Social_Network_Provider::SMS,
							Social_Network_Provider::WHATSAPP,
							Social_Network_Provider::SKYPE,
							Social_Network_Provider::MESSENGER,
							Social_Network_Provider::VIBER,
						],
						'limit' => 5,
					],
					'default' => [
						[
							'contact_icon_platform' => Social_Network_Provider::WHATSAPP,
						],
						[
							'contact_icon_platform' => Social_Network_Provider::EMAIL,
						],
						[
							'contact_icon_platform' => Social_Network_Provider::SMS,
						],
						[
							'contact_icon_platform' => Social_Network_Provider::VIBER,
						],
						[
							'contact_icon_platform' => Social_Network_Provider::MESSENGER,
						],
					],
				],
			],
			'style' => [
				'has_platform_colors' => true,
				'message_bubble_section' => [
					'has_chat_background' => true,
				],
				'contact_section' => [
					'has_buttons_heading' => true,
					'buttons_heading_label' => esc_html__( 'Buttons', 'elementor' ),
					'has_buttons_size' => true,
					'has_box_shadow' => false,
					'has_buttons_spacing' => false,
					'has_hover_animation' => true,
					'has_chat_box_animation' => false,
					'has_icon_bg_color' => true,
					'has_button_bar' => false,
				],
			],
			'advanced' => [
				'has_horizontal_position' => true,
			],
		];
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

		$this->add_content_tab();

		$this->add_style_tab();

		$this->add_advanced_tab();
	}

	const BOX_SHADOW_FIELDS_OPTIONS = [
		'box_shadow_type' => [
			'default' => 'yes',
		],
		'box_shadow' => [
			'default' => [
				'horizontal' => 4,
				'vertical' => 4,
				'blur' => 10,
				'spread' => 0,
				'color' => 'rgba(0,0,0,0.15)',
			],
		],
	];

	private function social_media_controls(): void {

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
						Social_Network_Provider::TELEPHONE,
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
			'chat_button_waze',
			[
				'label' => esc_html__( 'Location', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter the location', 'elementor' ),
				'condition' => [
					'chat_button_platform' => [
						Social_Network_Provider::WAZE,
					],
				],
			],
		);
	}

	protected function add_chat_button_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'chat_button_section',
			[
				'label' => $config['content']['chat_button_section']['section_name'],
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		if ( $config['content']['chat_button_section']['has_platform'] ) {

			$this->add_control(
				'chat_button_platform',
				[
					'label' => esc_html__( 'Platform', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => Social_Network_Provider::WHATSAPP,
					'options' => Social_Network_Provider::get_social_networks_text(
						$config['content']['chat_button_section']['platform']['group']
					),
				]
			);

			$this->social_media_controls();
		}

		if ( $config['content']['chat_button_section']['has_icon'] ) {
			$this->add_control(
				'chat_button_icon',
				[
					'label' => esc_html__( 'Icon', 'elementor' ),
					'type' => Controls_Manager::ICONS,
					'default' => $config['content']['chat_button_section']['icon_default'],
					'recommended' => [
						'fa-regular' => [
							'comment',
							'comment-dots',
							'comment-alt',
						],
						'fa-solid' => [
							'ellipsis-v',
						],
					],
				]
			);
		}

		if ( $config['content']['chat_button_section']['has_notification_dot'] ) {
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
		}

		$this->end_controls_section();
	}

	protected function add_top_bar_section(): void {
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

	protected function add_message_bubble_section(): void {
		$config = static::get_configuration();

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

		if ( $config['content']['message_bubble_section']['has_typing_animation'] ) {
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
		}

		$this->end_controls_section();
	}

	protected function add_contact_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'contact_section',
			[
				'label' => esc_html__( 'Contact Buttons', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		if ( $config['content']['contact_section']['has_cta_text'] ) {
			$this->add_control(
				'contact_cta_text',
				[
					'label' => esc_html__( 'Call to Action Text', 'elementor' ),
					'type' => Controls_Manager::TEXT,
					'default' => esc_html__( 'Start conversation:', 'elementor' ),
					'placeholder' => esc_html__( 'Type your text here', 'elementor' ),
				]
			);
		}

		if ( $config['content']['contact_section']['platform']['limit'] ) {
			$this->add_control(
				'contact_custom_panel_alert',
				[
					'type' => Controls_Manager::ALERT,
					'alert_type' => 'info',
					'content' => sprintf(
						__( 'Add up to <b>%d</b> icons', 'elementor' ),
						$config['content']['contact_section']['platform']['limit']
					),
				]
			);
		}

		$repeater = new Repeater();

		$repeater->add_control(
			'contact_icon_platform',
			[
				'label' => esc_html__( 'Platform', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => Social_Network_Provider::get_social_networks_text(
					$config['content']['contact_section']['platform']['group-1']
				),
				'default' => Social_Network_Provider::WHATSAPP,
			],
		);

		if ( $config['content']['contact_section']['has_tooltip'] ) {
			$repeater->add_control(
				'contact_tooltip',
				[
					'label' => $config['content']['contact_section']['icon_text_label'],
					'type' => Controls_Manager::TEXT,
					'dynamic' => [
						'active' => true,
					],
					'default' => 'Tooltip',
					'placeholder' => esc_html__( 'Enter icon text', 'elementor' ),
				],
			);
		}

		$repeater->add_control(
			'contact_icon_mail',
			[
				'label' => esc_html__( 'Mail', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Enter your email', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
				'ai' => [
					'active' => false,
				],
			]
		);

		$repeater->add_control(
			'contact_icon_mail_subject',
			[
				'label' => esc_html__( 'Subject', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Subject', 'elementor' ),
				'label_block' => true,
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
			]
		);

		$repeater->add_control(
			'contact_icon_mail_body',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => esc_html__( 'Message', 'elementor' ),
				'label_block' => true,
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
			]
		);

		$repeater->add_control(
			'contact_icon_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '+', 'elementor' ),
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::SMS,
						Social_Network_Provider::WHATSAPP,
						Social_Network_Provider::VIBER,
						Social_Network_Provider::TELEPHONE,
					],
				],
				'ai' => [
					'active' => false,
				],
			],
		);

		$repeater->add_control(
			'contact_icon_username',
			[
				'label' => esc_html__( 'Username', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter your username', 'elementor' ),
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::MESSENGER,
						Social_Network_Provider::SKYPE,
					],
				],
			],
		);

		$repeater->add_control(
			'contact_icon_url',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block' => true,
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::URL,
					],
				],
				'placeholder' => esc_html__( 'Paste URL or type', 'elementor' ),
			],
		);

		$repeater->add_control(
			'contact_icon_waze',
			[
				'label' => esc_html__( 'Location', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter the location', 'elementor' ),
				'condition' => [
					'contact_icon_platform' => [
						Social_Network_Provider::WAZE,
					],
				],
			],
		);

		$repeater->add_control(
			'contact_icon_viber_action',
			[
				'label' => esc_html__( 'Action', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'chat',
				'dynamic' => [
					'active' => true,
				],
				'options' => [
					'chat' => 'Chat',
					'contact' => 'Contact',
				],
				'condition' => [
					'contact_icon_platform' => Social_Network_Provider::VIBER,
				],
			]
		);

		$this->add_control(
			'contact_repeater',
			[
				'max_items' => $config['content']['contact_section']['platform']['limit'],
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'title_field' => $this->get_icon_title_field(),
				'prevent_empty' => true,
				'button_text' => esc_html__( 'Add Icon', 'elementor' ),
				'default' => $config['content']['contact_section']['default'],
			]
		);

		$this->end_controls_section();
	}

	protected function get_icon_title_field(): string {
		$platform_icons_js = json_encode( Social_Network_Provider::get_social_networks_icons() );
		$platform_text_js = json_encode( Social_Network_Provider::get_social_networks_text() );

		return <<<JS
	<#
	elementor.helpers.enqueueIconFonts( 'fa-solid' );
	elementor.helpers.enqueueIconFonts( 'fa-brands' );
	const mapping = {$platform_icons_js};
	const text_mapping = {$platform_text_js};
	#>
	<i class='{{{ mapping[contact_icon_platform] }}}' ></i> {{{ text_mapping[contact_icon_platform] }}}
JS;
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

	protected function add_content_tab(): void {
		$this->add_chat_button_section();

		$this->add_top_bar_section();

		$this->add_message_bubble_section();

		$this->add_send_button_section();
	}

	private function get_platform_color_condition( $condition ) {
		$config = static::get_configuration();

		if ( true == $config['style']['has_platform_colors'] ) {
			return $condition;
		}

		return null;
	}

	protected function add_style_chat_button_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'style_chat_button',
			[
				'label' => $config['content']['chat_button_section']['section_name'],
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_chat_button_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'small',
				'options' => [
					'small' => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large' => esc_html__( 'Large', 'elementor' ),
				],
				'separator' => 'after',
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

		if ( $config['style']['has_platform_colors'] ) {
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
		}

		$this->add_control(
			'style_button_color_icon',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-icon: {{VALUE}}',
				],
				'condition' => $this->get_platform_color_condition( [
					'style_button_color_select' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_button_color_select' => 'custom',
				] ),
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'style_button_color_tabs_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		if ( $config['style']['has_platform_colors'] ) {
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
		}

		$this->add_control(
			'style_button_color_icon_hover',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-icon-hover: {{VALUE}}',
				],
				'condition' => $this->get_platform_color_condition( [
					'style_button_color_select_hover' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_button_color_select_hover' => 'custom',
				] ),
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

		if ( $config['content']['chat_button_section']['has_active_tab'] ) {
			$this->start_controls_tab(
				'style_button_color_tabs_active',
				[
					'label' => esc_html__( 'Active', 'elementor' ),
				]
			);

			$this->add_control(
				'style_button_color_icon_active',
				[
					'label' => esc_html__( 'Icon Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-close-button-color: {{VALUE}}',
					],
				]
			);

			$this->add_control(
				'style_button_color_background_active',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-close-button-bg: {{VALUE}}',
					],
					'separator' => 'after',
				]
			);

			$this->end_controls_tab();
		}

		$this->end_controls_tabs();

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'style_chat_button_box_shadow',
				'selector' => '{{WRAPPER}} .e-contact-buttons__chat-button-shadow',
				'fields_options' => static::BOX_SHADOW_FIELDS_OPTIONS,
			]
		);

		$this->add_responsive_control(
			'style_chat_button_animation',
			[
				'label' => esc_html__( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'frontend_available' => true,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'style_chat_button_animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 800,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 3000,
						'step' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-button-chat-button-animation-duration: {{SIZE}}ms;',
				],
				'condition' => [
					'style_chat_button_animation!' => '',
				],
			]
		);

		$this->add_control(
			'style_chat_button_animation_delay',
			[
				'label' => esc_html__( 'Animation Delay', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => 0,
				'min' => 0,
				'step' => 100,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-button-chat-button-animation-delay: {{SIZE}}ms;',
				],
				'condition' => [
					'style_chat_button_animation!' => '',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();
	}

	protected function add_style_top_bar_section(): void {
		$config = static::get_configuration();

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

		if ( $config['style']['has_platform_colors'] ) {
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
					'separator' => 'before',
				]
			);
		}

		$this->add_control(
			'style_top_bar_name_heading',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => ! $config['style']['has_platform_colors'] ? 'before' : false,
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
				'condition' => $this->get_platform_color_condition( [
					'style_top_bar_colors' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_top_bar_colors' => 'custom',
				] ),
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
			'style_top_bar_close_button_heading',
			[
				'label' => esc_html__( 'Close Button', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
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
				'condition' => $this->get_platform_color_condition( [
					'style_top_bar_colors' => 'custom',
				] ),
			]
		);

		$this->add_control(
			'style_top_bar_background_heading',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => false,
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
				'condition' => $this->get_platform_color_condition( [
					'style_top_bar_colors' => 'custom',
				] ),
			]
		);

		$this->end_controls_section();
	}

	protected function add_style_message_bubble_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'style_bubble_section',
			[
				'label' => esc_html__( 'Message Bubble', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		if ( $config['style']['has_platform_colors'] ) {
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
		}

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
				'condition' => $this->get_platform_color_condition( [
					'style_bubble_colors' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_bubble_colors' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_bubble_colors' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_bubble_colors' => 'custom',
				] ),
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
				'condition' => $this->get_platform_color_condition( [
					'style_bubble_colors' => 'custom',
				] ),
			]
		);

		if ( $config['style']['message_bubble_section']['has_chat_background'] ) {
			$this->add_control(
				'style_bubble_chat_heading',
				[
					'label' => esc_html__( 'Chat Background', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => false,
					'condition' => $this->get_platform_color_condition( [
						'style_bubble_colors' => 'custom',
					] ),
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
					'condition' => $this->get_platform_color_condition( [
						'style_bubble_colors' => 'custom',
					] ),
				]
			);
		}

		$this->end_controls_section();
	}

	protected function add_style_contact_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'style_contact_section',
			[
				'label' => esc_html__( 'Contact Buttons', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		if ( $config['content']['contact_section']['has_cta_text'] ) {
			$this->add_control(
				'style_contact_text_heading',
				[
					'label' => esc_html__( 'Call to Action Text', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => false,
					'condition' => $this->get_platform_color_condition( [
						'style_bubble_colors' => 'custom',
					] ),
				]
			);

			$this->add_control(
				'style_contact_text_color',
				[
					'label' => esc_html__( 'Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-text: {{VALUE}}',
					],
				]
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				[
					'name' => 'style_contact_text_typography',
					'selector' => '{{WRAPPER}} .e-contact-buttons__contact-text',
				]
			);
		}

		if ( $config['style']['contact_section']['has_buttons_heading'] ) {
			$this->add_control(
				'style_contact_buttons_heading',
				[
					'label' => $config['style']['contact_section']['buttons_heading_label'],
					'type' => Controls_Manager::HEADING,
					'separator' => false,
					'condition' => $this->get_platform_color_condition( [
						'style_bubble_colors' => 'custom',
					] ),
				]
			);
		}

		if ( $config['style']['contact_section']['has_buttons_size'] ) {
			$this->add_control(
				'style_contact_button_size',
				[
					'label' => esc_html__( 'Size', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => 'small',
					'options' => [
						'small' => esc_html__( 'Small', 'elementor' ),
						'medium' => esc_html__( 'Medium', 'elementor' ),
						'large' => esc_html__( 'Large', 'elementor' ),
					],
				]
			);
		}

		$this->start_controls_tabs(
			'style_contact_button_color_tabs'
		);

		$this->start_controls_tab(
			'style_contact_button_color_tabs_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'style_contact_button_color_icon',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-button-icon: {{VALUE}}',
				],
			]
		);

		if ( $config['style']['contact_section']['has_icon_bg_color'] ) {
			$this->add_control(
				'style_contact_button_color_background',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-button-bg: {{VALUE}}',
					],
				]
			);
		}

		$this->end_controls_tab();

		$this->start_controls_tab(
			'style_contact_button_color_tabs_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'style_contact_button_color_icon_hover',
			[
				'label' => esc_html__( 'Icon Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-button-icon-hover: {{VALUE}}',
				],
			]
		);

		if ( $config['style']['contact_section']['has_icon_bg_color'] ) {
			$this->add_control(
				'style_contact_button_color_background_hover',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-button-bg-hover: {{VALUE}}',
					],
				]
			);
		}

		if ( $config['style']['contact_section']['has_hover_animation'] ) {
			$this->add_control(
				'style_contact_button_hover_animation',
				[
					'label' => esc_html__( 'Hover Animation', 'elementor' ),
					'type' => Controls_Manager::HOVER_ANIMATION,
					'frontend_available' => true,
				]
			);
		}

		$this->end_controls_tab();

		$this->end_controls_tabs();

		if ( $config['style']['contact_section']['has_buttons_spacing'] ) {

			$this->add_responsive_control(
				'style_contact_buttons_spacing',
				[
					'label' => esc_html__( 'Buttons Spacing', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'%' => [
							'min' => 10,
							'max' => 100,
						],
						'px' => [
							'min' => 0,
							'max' => 100,
						],
					],
					'default' => [
						'unit' => 'px',
						'size' => 15,
					],
					'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-contact-gap: {{SIZE}}{{UNIT}}',
					],
					'separator' => 'before',
				]
			);
		}

		if ( $config['style']['contact_section']['has_box_shadow'] ) {
			$this->add_group_control(
				Group_Control_Box_Shadow::get_type(),
				[
					'name' => 'style_contact_icons_box_shadow',
					'selector' => '{{WRAPPER}} .e-contact-buttons__contact-box-shadow',
					'fields_options' => static::BOX_SHADOW_FIELDS_OPTIONS,
				]
			);
		}

		if ( $config['content']['contact_section']['has_tooltip'] ) {
			$this->add_control(
				'style_contact_tooltip_heading',
				[
					'label' => esc_html__( 'Tooltips', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => 'before',
				]
			);

			$this->add_control(
				'style_contact_tooltip_text_color',
				[
					'label' => esc_html__( 'Text Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-tooltip-text: {{VALUE}}',
					],
				]
			);

			$this->add_group_control(
				Group_Control_Typography::get_type(),
				[
					'name' => 'style_contact_tooltip_typography',
					'selector' => '{{WRAPPER}} .e-contact-buttons__contact-tooltip',
				]
			);

			$this->add_control(
				'style_contact_tooltip_bg_color',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-tooltip-bg: {{VALUE}}',
					],
				]
			);
		}

		if ( $config['style']['contact_section']['has_chat_box_animation'] ) {
			$this->chat_box_animation_controls();
		}

		if ( $config['style']['contact_section']['has_button_bar'] ) {
			$this->add_control(
				'style_contact_button_bar_heading',
				[
					'label' => esc_html__( 'Button Bar', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => 'before',
				]
			);

			$this->add_control(
				'style_contact_button_bar_bg_color',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-bar-bg: {{VALUE}}',
					],
				]
			);

			$this->add_control(
				'style_contact_button_bar_corners',
				[
					'label'     => esc_html__( 'Corners', 'elementor' ),
					'type'      => Controls_Manager::SELECT,
					'default'   => 'round',
					'options'   => [
						'round'   => esc_html__( 'Round', 'elementor' ),
						'rounded' => esc_html__( 'Rounded', 'elementor' ),
						'sharp'   => esc_html__( 'Sharp', 'elementor' ),
					],
				]
			);

			$this->add_responsive_control(
				'style_contact_button_bar_padding',
				[
					'label' => esc_html__( 'Padding', 'elementor' ),
					'type' => Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem' ],
					'default' => [
						'unit' => 'px',
						'isLinked' => false,
					],
					'selectors' => [
						'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-button-bar-padding-block-end: {{BOTTOM}}{{UNIT}}; --e-contact-buttons-button-bar-padding-block-start: {{TOP}}{{UNIT}}; --e-contact-buttons-button-bar-padding-inline-end: {{RIGHT}}{{UNIT}}; --e-contact-buttons-button-bar-padding-inline-start: {{LEFT}}{{UNIT}};',
					],
					'separator' => 'before',
				]
			);
		}

		$this->end_controls_section();
	}

	protected function add_style_send_button_section(): void {
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

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	protected function chat_box_animation_controls(): void {
		$this->add_responsive_control(
			'style_chat_box_entrance_animation',
			[
				'label' => esc_html__( 'Open Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'frontend_available' => true,
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'style_chat_box_exit_animation',
			[
				'label' => esc_html__( 'Close Animation', 'elementor' ),
				'type' => Controls_Manager::EXIT_ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'style_chat_box_animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 800,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 3000,
						'step' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-chat-box-animation-duration: {{SIZE}}ms;',
				],
			]
		);
	}

	protected function add_style_chat_box_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'style_chat_box_section',
			[
				'label' => esc_html__( 'Chat Box', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		if ( $config['style']['has_platform_colors'] ) {
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
		}

		$this->add_control(
			'style_chat_box_bg_color',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-chat-box-bg: {{VALUE}}',
				],
				'condition' => $this->get_platform_color_condition( [
					'style_chat_box_bg_select' => 'custom',
				] ),
			]
		);

		$this->add_responsive_control(
			'style_chat_box_width',
			[
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'min' => 10,
						'max' => 100,
					],
					'px' => [
						'min' => 0,
						'max' => 400,
					],
				],
				'default' => [
					'unit' => 'px',
					'size' => 360,
				],
				'mobile_default' => [
					'unit' => 'vw',
					'size' => 100,
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-contact-buttons' => '--e-contact-buttons-chat-box-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'style_chat_box_corners',
			[
				'label'     => esc_html__( 'Corners', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'rounded',
				'options'   => [
					'round'   => esc_html__( 'Round', 'elementor' ),
					'rounded' => esc_html__( 'Rounded', 'elementor' ),
					'sharp'   => esc_html__( 'Sharp', 'elementor' ),
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'style_chat_box_box_shadow',
				'selector' => '{{WRAPPER}} .e-contact-buttons__content',
				'fields_options' => static::BOX_SHADOW_FIELDS_OPTIONS,
			]
		);

		$this->chat_box_animation_controls();

		$this->end_controls_section();
	}

	protected function add_style_tab(): void {
		$this->add_style_chat_button_section();

		$this->add_style_top_bar_section();

		$this->add_style_message_bubble_section();

		$this->add_style_send_button_section();

		$this->add_style_chat_box_section();
	}

	private function add_advanced_tab(): void {
		$config = static::get_configuration();

		Controls_Manager::add_tab(
			static::TAB_ADVANCED,
			esc_html__( 'Advanced', 'elementor' )
		);

		if ( $config['advanced']['has_horizontal_position'] ) {
			$this->start_controls_section(
				'advanced_layout_section',
				[
					'label' => esc_html__( 'Layout', 'elementor' ),
					'tab'   => static::TAB_ADVANCED,
				]
			);

			$this->add_responsive_control(
				'advanced_horizontal_position',
				[
					'label' => esc_html__( 'Horizontal Position', 'elementor' ),
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
					'default' => 'end',
					'toggle' => true,
				]
			);

			$this->end_controls_section();
		}

		$this->start_controls_section(
			'advanced_responsive_section',
			[
				'label' => esc_html__( 'Responsive', 'elementor' ),
				'tab'   => static::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'responsive_description',
			[
				'raw' => sprintf(
					/* translators: 1: Link open tag, 2: Link close tag. */
					esc_html__( 'Responsive visibility will take effect only on %1$s preview mode %2$s or live page, and not while editing in Elementor.', 'elementor' ),
					'<a href="javascript: $e.run( \'panel/close\' )">',
					'</a>'
				),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-descriptor',
			]
		);

		$this->add_hidden_device_controls();

		$this->end_controls_section();

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
