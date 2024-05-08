<?php

namespace Elementor\Modules\ConversionCenter\Base;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Typography;
use Elementor\Modules\ConversionCenter\Classes\Providers\Social_Network_Provider;
use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Modules\ConversionCenter\Traits\Conversion_Center_Controls_Trait;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Utils;
use Elementor\Widget_Base;

abstract class Widget_Link_In_Bio_Base extends Widget_Base {

	use Conversion_Center_Controls_Trait;

	const TAB_ADVANCED = 'advanced-tab-links-in-bio';

	public static function get_configuration() {
		return [
			'content' => [
				'identity_section' => [
					'identity_image_style' => [
						'default' => 'profile',
					],
					'has_heading_text' => false,
					'has_profile_image_controls' => false,
				],
				'bio_section' => [
					'title' => [
						'default' => esc_html__( 'Kitchen Chronicles', 'elementor' ),
					],
					'description' => [
						'default' => esc_html__( 'Join me on my journey to a healthier lifestyle', 'elementor' ),
					],
					'has_about_field' => false,
				],
				'icon_section' => [
					'has_text' => false,
					'platform' => [
						'group-1' => [
							Social_Network_Provider::EMAIL,
							Social_Network_Provider::TELEPHONE,
							Social_Network_Provider::MESSENGER,
							Social_Network_Provider::WAZE,
							Social_Network_Provider::WHATSAPP,

						],
						'limit' => 5,
					],
					'default' => [
						[
							'icon_platform' => Social_Network_Provider::FACEBOOK,
						],
						[
							'icon_platform' => Social_Network_Provider::INSTAGRAM,
						],
						[
							'icon_platform' => Social_Network_Provider::TIKTOK,
						],
					],
				],
				'cta_section' => [
					'cta_max' => 0,
					'cta_has_image' => false,
					'cta_repeater_defaults' => [
						[
							'cta_link_text' => esc_html__( 'Get Healthy', 'elementor' ),
						],
						[
							'cta_link_text' => esc_html__( 'Top 10 Recipes', 'elementor' ),
						],
						[
							'cta_link_text' => esc_html__( 'Meal Prep', 'elementor' ),
						],
						[
							'cta_link_text' => esc_html__( 'Healthy Living Resources', 'elementor' ),
						],
					],
				],

			],
			'style' => [
				'identity_section' => [
					'has_profile_image_shape' => true,
				],
				'cta_section' => [
					'has_dividers' => false,
					'has_image_border' => false,
					'has_link_type' => [
						'default' => 'button',
					],
					'has_corners' => [
						'default' => 'rounded',
						'options' => [
							'round' => esc_html__( 'Round', 'elementor' ),
							'rounded' => esc_html__( 'Rounded', 'elementor' ),
							'sharp' => esc_html__( 'Sharp', 'elementor' ),
						],
					],
					'has_padding' => true,
					'has_background_control' => true,
					'has_cta_control_text' => false,
					'has_border_control' => [
						'prefix' => 'cta_links',
						'show_border_args' => [
							'condition' => [
								'cta_links_type' => 'button',
							],
						],
						'border_width_args' => [
							'condition' => [
								'cta_links_type' => 'button',
							],
							'selectors' => [
								'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-border-width: {{SIZE}}{{UNIT}}',
							],
						],
						'border_color_args' => [
							'condition' => [
								'cta_links_type' => 'button',
							],
							'selectors' => [
								'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-border-color: {{VALUE}}',
							],
						],
					],
				],
				'border_section' => [
					'field_options' => false,
				],
			],

		];
	}

	public function get_description_position() {
		return 'top';
	}

	public function get_icon(): string {
		return 'eicon-bullet-list';
	}

	public function get_categories(): array {
		return [ 'general' ];
	}

	public function get_keywords(): array {
		return [ 'buttons', 'bio', 'widget' ];
	}

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( ConversionCenterModule::EXPERIMENT_NAME );
	}

	public function get_stack( $with_common_controls = true ): array {
		return parent::get_stack( false );
	}

	protected function register_controls(): void {

		$this->add_content_tab();

		$this->add_style_tab();

		$this->add_advanced_tab();
	}

	protected function render(): void {
		$render_strategy = new Core_Render( $this );

		$render_strategy->render();
	}

	protected function add_cta_controls() {
		$config = static::get_configuration();

		if ( empty( $config['content']['cta_section'] ) ) {
			return;
		}

		$this->start_controls_section(
			'cta_section',
			[
				'label' => esc_html__( 'CTA Link Buttons', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		if ( ! empty( $config['content']['cta_section']['cta_max'] ) ) {
			$this->add_control(
				'cta_section_alert',
				[
					'type' => Controls_Manager::ALERT,
					'alert_type' => 'info',
					'content' => sprintf(
						__( 'Add up to <b>%d</b> CTA links', 'elementor' ),
						$config['content']['cta_section']['cta_max']
					),
				]
			);
		}

		$repeater = new Repeater();

		$repeater->add_control(
			'cta_link_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'default' => '',
				'placeholder' => esc_html__( 'Enter link text', 'elementor' ),
			],
		);

		if ( $config['content']['cta_section']['cta_has_image'] ) {
			$repeater->add_control(
				'cta_link_image',
				[
					'label' => esc_html__( 'Choose Image', 'elementor' ),
					'type' => Controls_Manager::MEDIA,
					'label_block' => true,
					'default' => [
						'url' => Utils::get_placeholder_image_src(),
					],
				]
			);
		}

		$repeater->add_control(
			'cta_link_type',
			[
				'label' => esc_html__( 'Link Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'groups' => [

					[
						'label' => '',
						'options' => Social_Network_Provider::get_social_networks_text(
							[
								Social_Network_Provider::URL,
								Social_Network_Provider::FILE_DOWNLOAD,
							]
						),
					],
					[
						'label' => '   --',
						'options' => Social_Network_Provider::get_social_networks_text(
							[
								Social_Network_Provider::EMAIL,
								Social_Network_Provider::TELEPHONE,
								Social_Network_Provider::MESSENGER,
								Social_Network_Provider::WAZE,
								Social_Network_Provider::WHATSAPP,
							]
						),
					],
				],
				'default' => Social_Network_Provider::URL,
			],
		);

		$repeater->add_control(
			'cta_link_file',
			[
				'label' => esc_html__( 'Choose File', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'label_block' => true,
				'media_type' => [ 'application/pdf' ],
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::FILE_DOWNLOAD,
					],
				],
			],
		);

		$repeater->add_control(
			'cta_link_url',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'options' => false,
				'dynamic' => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::URL,
					],
				],
				'placeholder' => esc_html__( 'Enter your link', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_mail',
			[
				'label' => esc_html__( 'Mail', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::EMAIL,
					],
				],
				'placeholder' => esc_html__( 'Enter your email', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_mail_subject',
			[
				'label' => esc_html__( 'Subject', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::EMAIL,
					],
				],
				'placeholder' => esc_html__( 'Subject', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_mail_body',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::EMAIL,
					],
				],
				'placeholder' => esc_html__( 'Message', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::TELEPHONE,
						Social_Network_Provider::WHATSAPP,
					],
				],
				'placeholder' => esc_html__( 'Enter your number', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_location',
			[
				'label' => esc_html__( 'Location', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::WAZE,
					],
				],
				'placeholder' => esc_html__( 'Enter your location', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_username',
			[
				'label' => esc_html__( 'Username', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'cta_link_type' => [
						Social_Network_Provider::MESSENGER,
					],
				],
				'placeholder' => esc_html__( 'Enter your username', 'elementor' ),
			],
		);

		$this->add_control(
			'cta_link',
			[
				'type' => Controls_Manager::REPEATER,
				'max_items' => $config['content']['cta_section']['cta_max'] ?? 0,
				'fields' => $repeater->get_controls(),
				'title_field' => '{{{ cta_link_text }}}',
				'prevent_empty' => true,
				'button_text' => esc_html__( 'Add CTA Link', 'elementor' ),
				'default' => $config['content']['cta_section']['cta_repeater_defaults'],
			]
		);

		$this->end_controls_section();
	}

	protected function add_icons_controls(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'icons_section',
			[
				'label' => esc_html__( 'Icons', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		if ( $config['content']['icon_section']['platform']['limit'] ) {
			$this->add_control(
				'custom_panel_alert',
				[
					'type' => Controls_Manager::ALERT,
					'alert_type' => 'info',
					'content' => sprintf(
						__( 'Add up to <b>%d</b> icons', 'elementor' ),
						$config['content']['icon_section']['platform']['limit']
					),
				]
			);
		}

		$repeater = new Repeater();

		if ( $config['content']['icon_section']['has_text'] ) {
			$repeater->add_control(
				'icon_text',
				[
					'label' => esc_html__( 'Text', 'elementor' ),
					'type' => Controls_Manager::TEXT,
					'dynamic' => [
						'active' => true,
					],
					'placeholder' => esc_html__( 'Enter icon text', 'elementor' ),
				],
			);
		}

		$repeater->add_control(
			'icon_platform',
			[
				'label' => esc_html__( 'Platform', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'groups' => [

					[
						'label' => '',
						'options' => Social_Network_Provider::get_social_networks_text(
							$config['content']['icon_section']['platform']['group-1']
						),
					],
					[
						'label' => '   --',
						'options' => Social_Network_Provider::get_social_networks_text(
							[
								Social_Network_Provider::FACEBOOK,
								Social_Network_Provider::INSTAGRAM,
								Social_Network_Provider::LINKEDIN,
								Social_Network_Provider::PINTEREST,
								Social_Network_Provider::TIKTOK,
								Social_Network_Provider::TWITTER,
								Social_Network_Provider::YOUTUBE,
							]
						),
					],
					[
						'label' => '   --',
						'options' => Social_Network_Provider::get_social_networks_text(
							[
								Social_Network_Provider::APPLEMUSIC,
								Social_Network_Provider::BEHANCE,
								Social_Network_Provider::DRIBBBLE,
								Social_Network_Provider::SPOTIFY,
								Social_Network_Provider::SOUNDCLOUD,
								Social_Network_Provider::VIMEO,
							]
						),
					],
				],
				'default' => Social_Network_Provider::FACEBOOK,
			],
		);

		$repeater->add_control(
			'icon_url',
			[
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'options' => false,
				'dynamic' => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter your link', 'elementor' ),
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::VIMEO,
						Social_Network_Provider::FACEBOOK,
						Social_Network_Provider::SOUNDCLOUD,
						Social_Network_Provider::SPOTIFY,
						Social_Network_Provider::INSTAGRAM,
						Social_Network_Provider::LINKEDIN,
						Social_Network_Provider::PINTEREST,
						Social_Network_Provider::TIKTOK,
						Social_Network_Provider::TWITTER,
						Social_Network_Provider::YOUTUBE,
						Social_Network_Provider::APPLEMUSIC,
						Social_Network_Provider::BEHANCE,
						Social_Network_Provider::DRIBBBLE,
						Social_Network_Provider::SPOTIFY,
						Social_Network_Provider::SOUNDCLOUD,
						Social_Network_Provider::URL,
					],
				],
			],
		);

		$repeater->add_control(
			'icon_mail',
			[
				'label' => esc_html__( 'Mail', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Enter your email', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
				'ai' => [
					'active' => false,
				],
			]
		);

		$repeater->add_control(
			'icon_mail_subject',
			[
				'label' => esc_html__( 'Subject', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Subject', 'elementor' ),
				'label_block' => true,
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
			]
		);

		$repeater->add_control(
			'icon_mail_body',
			[
				'label' => esc_html__( 'Message', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => esc_html__( 'Message', 'elementor' ),
				'label_block' => true,
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::EMAIL,
					],
				],
			]
		);

		$repeater->add_control(
			'icon_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '+', 'elementor' ),
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::TELEPHONE,
						Social_Network_Provider::WHATSAPP,
					],
				],
				'ai' => [
					'active' => false,
				],
			],
		);

		$repeater->add_control(
			'icon_location',
			[
				'label' => esc_html__( 'Location', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter your location', 'elementor' ),
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::WAZE,
					],
				],
				'ai' => [
					'active' => false,
				],
			],
		);

		$repeater->add_control(
			'icon_username',
			[
				'label' => esc_html__( 'Username', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter your username', 'elementor' ),
				'condition' => [
					'icon_platform' => [
						Social_Network_Provider::MESSENGER,
					],
				],
			],
		);

		$this->add_control(
			'icon',
			[
				'max_items' => $config['content']['icon_section']['platform']['limit'],
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'title_field' => $this->get_icon_title_field(),
				'prevent_empty' => true,
				'button_text' => esc_html__( 'Add Icon', 'elementor' ),
				'default' => $config['content']['icon_section']['default'],
			]
		);

		$this->end_controls_section();
	}

	protected function get_icon_title_field(): string {
		$platform_icons_js = json_encode( Social_Network_Provider::get_social_networks_icons() );

		return <<<JS
	<#
	elementor.helpers.enqueueIconFonts( 'fa-solid' );
	elementor.helpers.enqueueIconFonts( 'fa-brands' );
	const mapping = {$platform_icons_js};
	#>
	<i class='{{{ mapping[icon_platform] }}}' ></i> {{{ icon_platform }}}
JS;
	}

	protected function add_style_tab(): void {

		$this->add_style_identity_controls();

		$this->add_style_bio_controls();

		$this->add_style_icons_controls();

		$this->add_style_cta_section();

		$this->add_style_background_controls();

	}

	protected function add_advanced_tab(): void {
		Controls_Manager::add_tab(
			static::TAB_ADVANCED,
			esc_html__( 'Advanced', 'elementor' )
		);

		$this->start_controls_section(
			'advanced_layout_section',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => static::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'advanced_layout_full_width_custom',
			[
				'label' => esc_html__( 'Full Width', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'default' => '',
			]
		);

		$this->add_responsive_control(
			'advanced_layout_width',
			[
				'label' => esc_html__( 'Layout Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 500,
						'step' => 1,
					],
				],
				'default' => [
					'unit' => 'px',
				],
				'condition' => [
					'advanced_layout_full_width_custom' => '',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-container-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'advanced_layout_content_width',
			[
				'label' => esc_html__( 'Content Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 400,
						'step' => 1,
					],
				],
				'default' => [
					'unit' => 'px',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-content-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'advanced_layout_full_screen_height',
			[
				'label' => esc_html__( 'Full Screen Height', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => '',
				'condition' => [
					'advanced_layout_full_width_custom' => 'yes',
				],
			],
		);

		// Getting active breakpoints and setting dynamic options
		$active_breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $active_breakpoints as $breakpoint_key => $breakpoint ) {
			$available_devices[ $breakpoint_key ] = $breakpoint->get_label();
			$default_devices[] = $breakpoint_key;
		}

		$this->add_control(
			'advanced_layout_full_screen_height_controls',
			[
				'label' => esc_html__( 'Apply Full Screen Height on', 'elementor' ),
				'type' => Controls_Manager::SELECT2,
				'label_block' => true,
				'multiple' => true,
				'options' => $available_devices,
				'default' => $default_devices,
				'condition' => [
					'advanced_layout_full_width_custom' => 'yes',
					'advanced_layout_full_screen_height' => 'yes',
				],
			]
		);

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

	protected function add_bio_section(): void {
		$config = static::get_configuration();
		$this->start_controls_section(
			'bio_section',
			[
				'label' => esc_html__( 'Bio', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'bio_heading',
			[
				'label' => esc_html__( 'Heading', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Heading', 'elementor' ),
				'default' => esc_html__( 'Sara Parker', 'elementor' ),
			]
		);

		$this->add_html_tag_control( 'bio_heading_tag', 'h1' );

		$this->add_control(
			'bio_title',
			[
				'label' => esc_html__( 'Title or Tagline', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Title', 'elementor' ),
				'default' => $config['content']['bio_section']['title']['default'],
			]
		);

		$this->add_html_tag_control( 'bio_title_tag', 'h2' );

		if ( $config['content']['bio_section']['has_about_field'] ) {
			$this->add_control(
				'bio_about',
				[
					'label' => esc_html__( 'About Heading', 'elementor' ),
					'type' => Controls_Manager::TEXTAREA,
					'dynamic' => [
						'active' => true,
					],
					'placeholder' => esc_html__( 'About', 'elementor' ),
					'default' => esc_html__( 'About Me', 'elementor' ),
				]
			);
			$this->add_html_tag_control( 'bio_about_tag', 'h3' );
		}

		$this->add_control(
			'bio_description',
			[
				'label' => esc_html__( 'Description', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Description', 'elementor' ),
				'default' => $config['content']['bio_section']['description']['default'],
			]
		);

		$this->end_controls_section();
	}

	protected function add_identity_section(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'identity_section',
			[
				'label' => esc_html__( 'Identity', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		if ( $config['content']['identity_section']['has_profile_image_controls'] ) {
			$this->add_control(
				'identity_heading_cover',
				[
					'label' => esc_html__( 'Cover', 'elementor' ),
					'type' => Controls_Manager::HEADING,
					'separator' => 'before',
				]
			);

			$this->add_control(
				'identity_image_cover',
				[
					'label' => esc_html__( 'Choose Image', 'elementor' ),
					'type' => Controls_Manager::MEDIA,
					'default' => [
						'url' => Utils::get_placeholder_image_src(),
					],
				]
			);
		}

		if ( $config['content']['identity_section']['has_heading_text'] ) {
			$this->add_control(
				'identity_heading',
				[
					'label' => $config['content']['identity_section']['has_heading_text'],
					'type' => Controls_Manager::HEADING,
				]
			);
		}

		if ( $config['content']['identity_section']['identity_image_style'] ) {
			$this->add_control(
				'identity_image_style',
				[
					'label' => esc_html__( 'Image style', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $config['content']['identity_section']['identity_image_style']['default'],
					'options' => [
						'profile' => esc_html__( 'Profile', 'elementor' ),
						'cover' => esc_html__( 'Cover', 'elementor' ),
					],
				]
			);
		}

		$this->add_control(
			'identity_image',
			[
				'label' => esc_html__( 'Choose Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->end_controls_section();
	}

	protected function add_style_cta_section(): void {
		$config = static::get_configuration();

		if ( empty( $config['style']['cta_section'] ) ) {
			return;
		}

		$this->start_controls_section(
			'cta_links_section_style',
			[
				'label' => esc_html__( 'CTA Links', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		if ( $config['style']['cta_section']['has_cta_control_text'] ) {
			$this->add_control(
				'cta_links_heading',
				[
					'label' => $config['style']['cta_section']['has_cta_control_text'],
					'type' => Controls_Manager::HEADING,
				]
			);
		}

		if ( $config['style']['cta_section']['has_link_type'] ) {
			$this->add_control(
				'cta_links_type',
				[
					'label' => esc_html__( 'Type', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $config['style']['cta_section']['has_link_type']['default'],
					'options' => [
						'button' => esc_html__( 'Button', 'elementor' ),
						'link' => esc_html__( 'Link', 'elementor' ),
					],
				]
			);
		}

		$this->add_control(
			'cta_links_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-text-color: {{VALUE}}',
					'{{WRAPPER}} .e-link-in-bio__cta.is-type-link' => '--e-link-in-bio-ctas-text-color: {{VALUE}}',
				],
			]
		);

		$condition_if_has_links = [];
		if ( $config['style']['cta_section']['has_link_type'] ) {
			$condition_if_has_links = [
				'cta_links_type' => 'button',
			];
		}

		if ( $config['style']['cta_section']['has_background_control'] ) {
			$this->add_control(
				'cta_links_background_color',
				[
					'label' => esc_html__( 'Background Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'condition' => $condition_if_has_links,
					'selectors' => [
						'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-background-color: {{VALUE}}',
					],
				]
			);
		}

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'cta_links_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		if ( $config['style']['cta_section']['has_border_control'] ) {
			$this->add_borders_control(
				$config['style']['cta_section']['has_border_control']['prefix'],
				$config['style']['cta_section']['has_border_control']['show_border_args'],
				$config['style']['cta_section']['has_border_control']['border_width_args'],
				$config['style']['cta_section']['has_border_control']['border_color_args'],
			);
		}

		if ( $config['style']['cta_section']['has_corners'] ) {
			$this->add_control(
				'cta_links_corners',
				[
					'label' => esc_html__( 'Corners', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $config['style']['cta_section']['has_corners']['default'],
					'options' => $config['style']['cta_section']['has_corners']['options'],
					'condition' => $condition_if_has_links,
				]
			);
		}

		if ( $config['style']['cta_section']['has_padding'] ) {
			$this->add_control(
				'cta_links_hr',
				[
					'type' => Controls_Manager::DIVIDER,
				]
			);

			$this->add_responsive_control(
				'cta_links_padding',
				[
					'label' => esc_html__( 'Padding', 'elementor' ),
					'type' => Controls_Manager::DIMENSIONS,
					'size_units' => [ 'px', '%', 'em', 'rem' ],
					'default' => [
						'unit' => 'px',
						'isLinked' => false,
					],
					'condition' => $condition_if_has_links,
					'selectors' => [
						'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-padding-block-end: {{BOTTOM}}{{UNIT}}; --e-link-in-bio-ctas-padding-block-start: {{TOP}}{{UNIT}}; --e-link-in-bio-ctas-padding-inline-end: {{RIGHT}}{{UNIT}}; --e-link-in-bio-ctas-padding-inline-start: {{LEFT}}{{UNIT}};',
					],
				]
			);
		}

		if ( $config['style']['cta_section']['has_dividers'] ) {
			$this->add_control(
				'cta_links_hr',
				[
					'type' => Controls_Manager::HEADING,
					'label' => esc_html__( 'Dividers', 'elementor' ),
					'separator' => 'before',
				]
			);

			$this->add_responsive_control(
				'cta_links_divider_color',
				[
					'label' => esc_html__( 'Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'selectors' => [
						'{{WRAPPER}} .e-link-in-bio__cta' => 'border-bottom-color: {{VALUE}}',
					],
				]
			);

			$this->add_control(
				'cta_links_divider_width',
				[
					'label' => esc_html__( 'Weight', 'elementor' ) . ' (px)',
					'type' => Controls_Manager::SLIDER,
					'size_units' => [ 'px' ],
					'range' => [
						'px' => [
							'min' => 0,
							'max' => 10,
							'step' => 1,
						],
					],
					'default' => [
						'unit' => 'px',
					],
					'selectors' => [
						'{{WRAPPER}} .e-link-in-bio__cta' => 'border-bottom-width: {{SIZE}}{{UNIT}}',
					],
				]
			);
		}

		$this->end_controls_section();
	}

	protected function add_style_identity_controls(): void {
		$config = static::get_configuration();

		$this->start_controls_section(
			'identity_section_style',
			[
				'label' => esc_html__( 'Identity', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$condition = [];
		if ( $config['content']['identity_section']['identity_image_style'] ) {
			$condition = [
				'identity_image_style' => 'profile',
			];
		}

		$this->add_identity_image_profile_controls( $condition );

		$condition = [
			'identity_image_style' => 'cover',
		];

		$this->add_identity_image_cover_control( $condition );

		$this->end_controls_section();
	}

	protected function add_content_tab(): void {

		$this->add_identity_section();

		$this->add_bio_section();

		$this->add_icons_controls();

		$this->add_cta_controls();
	}

	protected function add_style_bio_controls(): void {
		$this->start_controls_section(
			'bio_section_style',
			[
				'label' => esc_html__( 'Bio', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'bio_heading_heading',
			[
				'label' => esc_html__( 'Heading', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_heading_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'bio_heading_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__heading',
			]
		);

		$this->add_control(
			'bio_title_heading',
			[
				'label' => esc_html__( 'Title or Tagline', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_title_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-title-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'bio_title_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__title',
			]
		);

		$this->add_control(
			'bio_description_heading',
			[
				'label' => esc_html__( 'Description', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_description_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-description-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'bio_description_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__description',
			]
		);

		$this->end_controls_section();
	}

	protected function add_style_icons_controls(): void {

		$this->start_controls_section(
			'icons_section_style',
			[
				'label' => esc_html__( 'Icons', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'icons_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-icon-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'icons_size',
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

		$this->end_controls_section();
	}

	protected function add_style_background_controls(): void {
		$this->start_controls_section(
			'background_border_section_style',
			[
				'label' => esc_html__( 'Background and Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'background_border_background',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$bg_image_field_options = [
			'background' => [
				'default' => 'classic',
			],
		];

		$config = static::get_configuration();

		if ( $config['style']['border_section']['field_options'] ) {
			$bg_image_field_options = array_merge( $bg_image_field_options, $config['style']['border_section']['field_options'] );
		}

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_border_background_group',
				'types' => [ 'classic', 'gradient' ],
				'selector' => '{{WRAPPER}} .e-link-in-bio__bg',
				'fields_options' => $bg_image_field_options,
			]
		);

		$this->add_control(
			'background_border_background_overlay',
			[
				'label' => esc_html__( 'Background Overlay', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_border_background_overlay_group',
				'types' => [ 'classic', 'gradient' ],
				'selector' => '{{WRAPPER}} .e-link-in-bio__bg-overlay',
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
				],
			]
		);

		$this->add_responsive_control(
			'background_overlay_opacity',
			[
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'max' => 1,
						'min' => 0.10,
						'step' => 0.01,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 0.5,
				],
				'condition' => [
					'background_border_background_overlay_group_background!' => '',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--background-overlay-opacity: {{SIZE}};',
				],
			]
		);

		$this->add_control(
			'background_hr',
			[
				'type' => Controls_Manager::DIVIDER,
			]
		);

		$this->add_control(
			'background_show_border',
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => '',
			]
		);

		$this->add_responsive_control(
			'background_border_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => $this->get_border_width_range(),
				],
				'condition' => [
					'background_show_border' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-border-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'background_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => [
					'background_show_border' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-border-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function get_border_width_range(): array {
		return [
			'min' => 0,
			'max' => 10,
			'step' => 1,
		];
	}

	protected function add_identity_image_profile_controls( array $condition ): void {
		$config = static::get_configuration();

		$this->add_responsive_control(
			'identity_image_size',
			[
				'label' => esc_html__( 'Image Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'unit' => 'px',
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'condition' => $condition,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		if ( $config['style']['identity_section']['has_profile_image_shape'] ) {
			$this->add_control(
				'identity_image_shape',
				[
					'label' => esc_html__( 'Image Shape', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => 'circle',
					'options' => [
						'circle' => esc_html__( 'Circle', 'elementor' ),
						'square' => esc_html__( 'Square', 'elementor' ),
					],
					'condition' => $condition,
				]
			);
		}

		$this->add_control(
			'identity_image_show_border',
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => '',
				'condition' => $condition,
			]
		);

		$this->add_responsive_control(
			'identity_image_border_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => $this->get_border_width_range(),
				],
				'condition' => array_merge(
					$condition,
					[
						'identity_image_show_border' => 'yes',
					]
				),
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-border-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array_merge(
					$condition,
					[
						'identity_image_show_border' => 'yes',
					]
				),
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-border-color: {{VALUE}};',
				],
			]
		);
	}

	protected function add_identity_image_cover_control( array $condition ): void {
		$this->add_responsive_control(
			'identity_image_height',
			[
				'label' => esc_html__( 'Image Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => 'px',
				],
				'condition' => $condition,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_show_bottom_border',
			[
				'label' => esc_html__( 'Bottom Border', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => '',
				'condition' => $condition,
			]
		);

		$this->add_control(
			'identity_image_border_bottom_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => $this->get_border_width_range(),
				],
				'condition' => array_merge(
					$condition,
					[
						'identity_image_show_bottom_border' => 'yes',
					]
				),
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-border-bottom-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_bottom_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'condition' => array_merge(
					$condition, [
						'identity_image_show_bottom_border' => 'yes',
					]
				),
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-border-color: {{VALUE}};',
				],
			]
		);
	}
}
