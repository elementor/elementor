<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Typography;
use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Utils;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Link in Bio widget.
 *
 * Elementor widget that displays an image, a bio, up to 4 CTA links and up to 5 icons.
 *
 * @since 3.23.0
 */
class Link_In_Bio extends Widget_Base {
	const TAB_ADVANCED = 'advanced-tab-custom';

	protected static $platform_icon_mapping = [
		'Facebook'    => 'fab fa-facebook',
		'Instagram'   => 'fab fa-instagram',
		'LinkedIn'    => 'fab fa-linkedin-in',
		'Pinterest'   => 'fab fa-pinterest',
		'TikTok'      => 'fab fa-tiktok',
		'X (Twitter)' => 'fab fa-x-twitter',
		'YouTube'     => 'fab fa-youtube',
		'Apple Music' => 'fab fa-apple',
		'Behance'     => 'fab fa-behance',
		'Dribble'     => 'fab fa-dribbble',
		'Spotify'     => 'fab fa-spotify',
		'SoundCloud'  => 'fab fa-soundcloud',
		'Vimeo'       => 'fab fa-vimeo-v',
		'Waze'        => 'fab fa-waze',
		'WhatsApp'    => 'fab fa-whatsapp',
		'Messenger'   => 'fab fa-facebook-messenger',
		'Telephone'   => 'fas fa-phone-alt',
		'Email'       => 'fas fa-envelope',
	];

	public static function get_mapping( string $platform ): string {
		return self::$platform_icon_mapping[ $platform ];

	}

	public function get_name(): string {
		return 'link-in-bio';
	}

	public function get_title(): string {
		return esc_html__( 'Link In Bio', 'elementor' );
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
		$this->add_identity_section();

		$this->add_bio_section();

		$this->add_icons_controls();

		$this->add_cta_controls();

		$this->add_style_tab();

		$this->add_advanced_tab();
	}

	protected function render(): void {
		$render_strategy = new Core_Render( $this );

		$render_strategy->render();
	}

	private function add_cta_controls(): void {
		$this->start_controls_section(
			'cta_section',
			[
				'label' => esc_html__( 'CTA Links', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'cta_section_alert',
			[
				'type'       => Controls_Manager::ALERT,
				'alert_type' => 'info',
				'content'    => sprintf(
					__( 'Add up to <b>%d</b> CTA links', 'elementor' ),
					4
				),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'cta_link_text',
			[
				'label'       => esc_html__( 'Text', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'default'     => '',
				'placeholder' => esc_html__( 'Enter link text', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_type',
			[
				'name'    => 'cta_link_type',
				'label'   => esc_html__( 'Link Type', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'groups'  => [

					[
						'label'   => '',
						'options' => [
							'Url'           => esc_html__( 'Url', 'elementor' ),
							'File Download' => esc_html__( 'File Download', 'elementor' ),
						],
					],
					[
						'label'   => '   --',
						'options' => [
							'Email'     => esc_html__( 'Email', 'elementor' ),
							'Telephone' => esc_html__( 'Telephone', 'elementor' ),
							'Messenger' => esc_html__( 'Messenger', 'elementor' ),
							'Waze'      => esc_html__( 'Waze', 'elementor' ),
							'WhatsApp'  => esc_html__( 'WhatsApp', 'elementor' ),
						],
					],
				],
				'default' => 'Url',
			],
		);

		$repeater->add_control(
			'cta_link_file',
			[
				'label'       => esc_html__( 'Choose File', 'elementor' ),
				'type'        => Controls_Manager::MEDIA,
				'label_block' => true,
				'condition'   => [
					'cta_link_type' => [
						'File Download',
					],
				],
			],
		);

		$repeater->add_control(
			'cta_link_url',
			[
				'label'        => esc_html__( 'Link', 'elementor' ),
				'type'         => Controls_Manager::URL,
				'options'      => false,
				'dynamic'      => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block'  => true,
				'condition'    => [
					'cta_link_type' => [
						'Waze',
						'Url',
					],
				],
				'placeholder'  => esc_html__( 'Enter your link', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_mail',
			[
				'name'        => 'cta_link_mail',
				'label'       => esc_html__( 'Mail', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'condition'   => [
					'cta_link_type' => [
						'Email',
					],
				],
				'placeholder' => esc_html__( 'Enter your email', 'elementor' ),
			],
		);

		$repeater->add_control(
			'cta_link_number',
			[
				'name'        => 'cta_link_number',
				'label'       => esc_html__( 'Number', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'condition'   => [
					'cta_link_type' => [
						'Telephone',
						'Messenger',
						'WhatsApp',
					],
				],
				'placeholder' => esc_html__( 'Enter your number', 'elementor' ),
			],
		);

		$this->add_control(
			'cta_link',
			[
				'type'          => Controls_Manager::REPEATER,
				'fields'        => $repeater->get_controls(),
				'title_field'   => '{{{ cta_link_text }}}',
				'prevent_empty' => true,
				'button_text'   => esc_html__( 'Add CTA Link', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}

	private function add_icons_controls(): void {
		$this->start_controls_section(
			'icons_section',
			[
				'label' => esc_html__( 'Icons', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'custom_panel_alert',
			[
				'type'       => Controls_Manager::ALERT,
				'alert_type' => 'info',
				'content'    => sprintf(
					__( 'Add up to <b>%d</b> icons', 'elementor' ),
					5
				),
			]
		);
		$repeater = new Repeater();

		$repeater->add_control(
			'icon_platform',
			[
				'label'   => esc_html__( 'Platform', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'groups'  => [

					[
						'label'   => '',
						'options' => [
							'Email'     => esc_html__( 'Email', 'elementor' ),
							'Telephone' => esc_html__( 'Telephone', 'elementor' ),
							'Messenger' => esc_html__( 'Messenger', 'elementor' ),
							'Waze'      => esc_html__( 'Waze', 'elementor' ),
							'WhatsApp'  => esc_html__( 'WhatsApp', 'elementor' ),
						],
					],
					[
						'label'   => '   --',
						'options' => [
							'Facebook'    => esc_html__( 'Facebook', 'elementor' ),
							'Instagram'   => esc_html__( 'Instagram', 'elementor' ),
							'LinkedIn'    => esc_html__( 'LinkedIn', 'elementor' ),
							'Pinterest'   => esc_html__( 'Pinterest', 'elementor' ),
							'TikTok'      => esc_html__( 'TikTok', 'elementor' ),
							'X (Twitter)' => esc_html__( 'X (Twitter)', 'elementor' ),
							'YouTube'     => esc_html__( 'YouTube', 'elementor' ),
						],
					],
					[
						'label'   => '   --',
						'options' => [
							'Apple Music' => esc_html__( 'Apple Music', 'elementor' ),
							'Behance'     => esc_html__( 'Behance', 'elementor' ),
							'Dribble'     => esc_html__( 'Dribble', 'elementor' ),
							'Spotify'     => esc_html__( 'Spotify', 'elementor' ),
							'SoundCloud'  => esc_html__( 'SoundCloud', 'elementor' ),
							'Vimeo'       => esc_html__( 'Vimeo', 'elementor' ),
						],
					],
				],
				'default' => 'Facebook',
			],
		);

		$repeater->add_control(
			'icon_url',
			[
				'label'        => esc_html__( 'Link', 'elementor' ),
				'type'         => Controls_Manager::URL,
				'options'      => false,
				'dynamic'      => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block'  => true,
				'placeholder'  => esc_html__( 'Enter your link', 'elementor' ),
				'condition'    => [
					'icon_platform' => [
						'Vimeo',
						'Facebook',
						'SoundCloud',
						'Spotify',
						'Instagram',
						'LinkedIn',
						'Pinterest',
						'TikTok',
						'X (Twitter)',
						'YouTube',
						'Apple Music',
						'Behance',
						'Dribble',
						'Spotify',
						'SoundCloud',
						'Vimeo',
						'Waze',
					],
				],
			],
		);

		$repeater->add_control(
			'icon_mail',
			[
				'label'       => esc_html__( 'Mail', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Enter your email', 'elementor' ),
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'condition'   => [
					'icon_platform' => [
						'Email',
					],
				],
			]
		);

		$repeater->add_control(
			'icon_mail_subject',
			[
				'label'       => esc_html__( 'Subject', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'placeholder' => esc_html__( 'Subject', 'elementor' ),
				'label_block' => true,
				'condition'   => [
					'icon_platform' => [
						'Email',
					],
				],
			]
		);

		$repeater->add_control(
			'icon_mail_message',
			[
				'label'       => esc_html__( 'Message', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'placeholder' => esc_html__( 'Message', 'elementor' ),
				'label_block' => true,
				'condition'   => [
					'icon_platform' => [
						'Email',
					],
				],
			]
		);

		$repeater->add_control(
			'icon_number',
			[
				'label'       => esc_html__( 'Number', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( 'Enter your number', 'elementor' ),
				'condition'   => [
					'icon_platform' => [
						'Telephone',
						'Messenger',
						'WhatsApp',
					],
				],
			],
		);

		$platform_icons_js = json_encode( self::$platform_icon_mapping );

		$this->add_control(
			'icon',
			[
				'type'          => Controls_Manager::REPEATER,
				'fields'        => $repeater->get_controls(),
				'title_field'   => "
<#
elementor.helpers.enqueueIconFonts( 'fa-solid' );
elementor.helpers.enqueueIconFonts( 'fa-brands' );
const mapping = {$platform_icons_js}; #>
<i class='{{{ mapping[icon_platform] }}}' ></i> {{{ icon_platform }}}
",
				'prevent_empty' => true,
				'button_text'   => esc_html__( 'Add Icon', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}


	private function add_style_tab(): void {
		$border_width_range = [
			'min'  => 0,
			'max'  => 10,
			'step' => 1,
		];

		$this->start_controls_section(
			'identity_section_style',
			[
				'label' => esc_html__( 'Identity', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		// Profile image style controls

		$this->add_control(
			'identity_image_size',
			[
				'label'      => esc_html__( 'Image Size', 'elementor' ),
				'type'       => Controls_Manager::SLIDER,
				'default'    => [
					'size' => 30,
					'unit' => '%',
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'condition'  => [
					'identity_image_style' => 'profile',
				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_shape',
			[
				'label'     => esc_html__( 'Image Shape', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'circle',
				'options'   => [
					'circle' => esc_html__( 'Circle', 'elementor' ),
					'square' => esc_html__( 'Square', 'elementor' ),
				],
				'condition' => [
					'identity_image_style' => 'profile',
				],
			]
		);

		$this->add_control(
			'identity_image_show_border',
			[
				'label'        => esc_html__( 'Border', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => [
					'identity_image_style' => 'profile',
				],
			]
		);

		$this->add_control(
			'identity_image_border_width',
			[
				'label'      => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range'      => [
					'px' => $border_width_range,
				],
				'condition'  => [
					'identity_image_style'       => 'profile',
					'identity_image_show_border' => 'yes',
				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-border-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_border_color',
			[
				'label'     => esc_html__( 'Border Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'condition' => [
					'identity_image_style'       => 'profile',
					'identity_image_show_border' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-profile-border-color: {{VALUE}};',
				],
			]
		);

		// Cover image style controls

		$this->add_control(
			'identity_image_height',
			[
				'label'      => esc_html__( 'Image Height', 'elementor' ),
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range'      => [
					'px' => [
						'min'  => 0,
						'max'  => 1000,
						'step' => 1,
					],
					'%'  => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default'    => [
					'unit' => '%',
					'size' => 50,
				],
				'condition'  => [
					'identity_image_style' => 'cover',
				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_show_bottom_border',
			[
				'label'        => esc_html__( 'Bottom Border', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => [
					'identity_image_style' => 'cover',
				],
			]
		);

		$this->add_control(
			'identity_image_border_bottom_width',
			[
				'label'      => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range'      => [
					'px' => $border_width_range,
				],
				'condition'  => [
					'identity_image_style'              => 'cover',
					'identity_image_show_bottom_border' => 'yes',

				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-border-bottom-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'identity_image_bottom_border_color',
			[
				'label'     => esc_html__( 'Border Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'condition' => [
					'identity_image_style'              => 'cover',
					'identity_image_show_bottom_border' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-identity-image-cover-border-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'bio_section_style',
			[
				'label' => esc_html__( 'Bio', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'bio_heading_heading',
			[
				'label'     => esc_html__( 'Heading', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_heading_text_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-heading-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'bio_heading_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__heading',
			]
		);

		$this->add_control(
			'bio_title_heading',
			[
				'label'     => esc_html__( 'Title or Tagline', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_title_text_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-title-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'bio_title_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__title',
			]
		);

		$this->add_control(
			'bio_description_heading',
			[
				'label'     => esc_html__( 'Description', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_description_text_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-description-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'bio_description_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__description',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'icons_section_style',
			[
				'label' => esc_html__( 'Icons', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'icons_color',
			[
				'label'     => esc_html__( 'Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-icon-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'icons_size',
			[
				'label'   => esc_html__( 'Size', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'small',
				'options' => [
					'small'  => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large'  => esc_html__( 'Large', 'elementor' ),
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'cta_links_section_style',
			[
				'label' => esc_html__( 'CTA Links', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'cta_links_type',
			[
				'label'   => esc_html__( 'Type', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'button',
				'options' => [
					'button' => esc_html__( 'Button', 'elementor' ),
					'link'   => esc_html__( 'Link', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'cta_links_text_color',
			[
				'label'     => esc_html__( 'Text Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-text-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'cta_links_background_color',
			[
				'label'     => esc_html__( 'Background Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'condition' => [
					'cta_links_type' => 'button',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-background-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name'     => 'cta_links_typography',
				'selector' => '{{WRAPPER}} .e-link-in-bio__cta',
			]
		);

		$this->add_control(
			'cta_links_show_border',
			[
				'label'        => esc_html__( 'Border', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => [
					'cta_links_type' => 'button',
				],
			]
		);

		$this->add_control(
			'cta_links_border_width',
			[
				'label'      => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range'      => [
					'px' => $border_width_range,
				],
				'condition'  => [
					'cta_links_show_border' => 'yes',
					'cta_links_type'        => 'button',
				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-border-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'cta_links_border_color',
			[
				'label'     => esc_html__( 'Border Color', 'elementor' ),
				'type'      => Controls_Manager::COLOR,
				'condition' => [
					'cta_links_show_border' => 'yes',
					'cta_links_type'        => 'button',
				],
				'selectors' => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-border-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'cta_links_corners',
			[
				'label'     => esc_html__( 'Corners', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'rounded',
				'options'   => [
					'round'   => esc_html__( 'Round', 'elementor' ),
					'rounded' => esc_html__( 'Rounded', 'elementor' ),
					'sharp'   => esc_html__( 'Sharp', 'elementor' ),
				],
				'condition' => [
					'cta_links_type' => 'button',
				],
			]
		);

		$this->add_control(
			'hr',
			[
				'type' => Controls_Manager::DIVIDER,
			]
		);

		$this->add_control(
			'cta_links_padding',
			[
				'label'      => esc_html__( 'Padding', 'elementor' ),
				'type'       => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem' ],
				'default'    => [
					'top'      => 0,
					'right'    => 0,
					'bottom'   => 0,
					'left'     => 0,
					'unit'     => 'px',
					'isLinked' => false,
				],
				'condition'  => [
					'cta_links_type' => 'button',
				],
				'selectors'  => [
					'{{WRAPPER}} .e-link-in-bio' => '--e-link-in-bio-ctas-padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'background_border_section_style',
			[
				'label' => esc_html__( 'Background and Border', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'background_border_background',
			[
				'label'     => esc_html__( 'Background', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'           => 'background_border_background_group',
				'types'          => [ 'classic', 'gradient' ],
				'exclude'        => [ 'image' ],
				'selector'       => '{{WRAPPER}} .e-link-in-bio__bg',
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
				],
			]
		);

		$this->add_control(
			'background_border_background_overlay',
			[
				'label'     => esc_html__( 'Background Overlay', 'elementor' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name'           => 'background_border_background_overlay_group',
				'types'          => [ 'classic', 'gradient' ],
				'exclude'        => [ 'image' ],
				'selector'       => '{{WRAPPER}} .e-link-in-bio__bg-overlay',
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
				],
			]
		);

		$this->end_controls_section();

	}

	private function add_advanced_tab() {
		Controls_Manager::add_tab(
			self::TAB_ADVANCED,
			esc_html__( 'Advanced', 'elementor' )
		);

		$this->start_controls_section(
			'advanced_layout_section',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab'   => self::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'advanced_layout_full_width_custom',
			[
				'label'     => esc_html__( 'Full Width', 'elementor' ),
				'type'      => Controls_Manager::SWITCHER,
				'label_on'  => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'default'   => '',
			]
			// TODO: add class selector when markup is done
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'advanced_layout_width',
			[
				'label'      => esc_html__( 'Layout Width', 'elementor' ) . ' (px)',
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range'      => [
					'px' => [
						'min'  => 0,
						'max'  => 500,
						'step' => 1,
					],
				],
				'default'    => [
					'size' => 360,
					'unit' => 'px',
				],
				'condition'  => [
					'advanced_layout_full_width_custom' => '',
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'advanced_layout_content_width',
			[
				'label'      => esc_html__( 'Content Width', 'elementor' ) . ' (px)',
				'type'       => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range'      => [
					'px' => [
						'min'  => 0,
						'max'  => 400,
						'step' => 1,
					],
				],
				'default'    => [
					'size' => 280,
					'unit' => 'px',
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'advanced_layout_center_vertical',
			[
				'label'        => esc_html__( 'Center Vertical', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
				'condition'    => [
					'advanced_layout_full_width_custom' => '',
				],
			],
			// TODO: add class selector when markup is done
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'advanced_layout_full_screen_height',
			[
				'label'        => esc_html__( 'Full Screen Height', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => '',
				'condition'    => [
					'advanced_layout_full_width_custom' => 'yes',
				],
			],
			// TODO: add class selector when markup is done
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'advanced_layout_full_screen_height_controls',
			[
				'label'       => esc_html__( 'Apply Full Screen Height on', 'elementor' ),
				'type'        => Controls_Manager::SELECT2,
				'label_block' => true,
				'multiple'    => true,
				'options'     => [
					'mobile'  => esc_html__( 'Mobile', 'elementor' ),
					'tablet'  => esc_html__( 'Tablet', 'elementor' ),
					'desktop' => esc_html__( 'Desktop', 'elementor' ),
					// TODO: allow choosing between 7 breakpoints if the breakpoints experiment is on
				],
				'default'     => [ 'mobile', 'tablet', 'desktop' ],
				'condition'   => [
					'advanced_layout_full_screen_height' => 'yes',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'advanced_custom_controls_sectionmax',
			[
				'label' => esc_html__( 'Custom', 'elementor' ),
				'tab'   => self::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'advanced_custom_css_id',
			[
				'label'          => esc_html__( 'CSS ID', 'elementor' ),
				'type'           => Controls_Manager::TEXT,
				'default'        => '',
				'dynamic'        => [
					'active' => true,
				],
				'style_transfer' => false,
			]
		);

		$this->add_control(
			'advanced_custom_css_classes',
			[
				'label'          => esc_html__( 'CSS Classes', 'elementor' ),
				'type'           => Controls_Manager::TEXT,
				'default'        => '',
				'dynamic'        => [
					'active' => true,
				],
				'style_transfer' => false,
			]
		);

		$this->end_controls_section();

		Plugin::$instance->controls_manager->add_custom_css_controls( $this, self::TAB_ADVANCED );
	}

	private function add_tag_control( string $name ): void {
		$this->add_control(
			$name,
			[
				'label'   => esc_html__( 'HTML Tag', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'options' => [
					'h1'   => 'H1',
					'h2'   => 'H2',
					'h3'   => 'H3',
					'h4'   => 'H4',
					'h5'   => 'H5',
					'h6'   => 'H6',
					'div'  => 'div',
					'span' => 'span',
					'p'    => 'p',
				],
				'default' => 'h2',
			]
		);
	}

	private function add_bio_section(): void {
		$this->start_controls_section(
			'bio_section',
			[
				'label' => esc_html__( 'Bio', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'bio_heading',
			[
				'label'       => esc_html__( 'Heading', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Heading', 'elementor' ),
			]
		);

		$this->add_tag_control( 'bio_heading_tag' );

		$this->add_control(
			'bio_title',
			[
				'label'       => esc_html__( 'Title or Tagline', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Title', 'elementor' ),
			]
		);

		$this->add_tag_control( 'bio_title_tag' );

		$this->add_control(
			'bio_description',
			[
				'label'       => esc_html__( 'Description', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Description', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}

	private function add_identity_section(): void {
		$this->start_controls_section(
			'identity_section',
			[
				'label' => esc_html__( 'Identity', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'identity_image_style',
			[
				'label'   => esc_html__( 'Image style', 'elementor' ),
				'type'    => Controls_Manager::SELECT,
				'default' => 'profile',
				'options' => [
					'profile' => esc_html__( 'Profile', 'elementor' ),
					'cover'   => esc_html__( 'Cover', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'identity_image',
			[
				'label'   => esc_html__( 'Choose Image', 'elementor' ),
				'type'    => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->end_controls_section();
	}
}
