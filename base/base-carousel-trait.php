<?php
namespace ElementorPro\Base;

use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use ElementorPro\Plugin;
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use Elementor\Group_Control_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Base_Carousel_Trait {
	public function add_carousel_layout_controls( $params ) {
		$slides_on_display = range( 1, $params['slides_on_display'] );
		$slides_on_display = array_combine( $slides_on_display, $slides_on_display );

		$slides_to_show_shared_settings = [
			'label' => esc_html__( 'Slides on display', 'elementor-pro' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => esc_html__( 'Default', 'elementor-pro' ),
			] + $slides_on_display,
			'inherit_placeholders' => false,
			'frontend_available' => true,
			'render_type' => 'template',
			'content_classes' => 'elementor-control-field-select-small',
		];

		$this->add_responsive_control(
			'slides_to_show',
			$params['slides_to_show_custom_settings'] + $slides_to_show_shared_settings
		);

		$slides_to_scroll_shared_settings = [
			'label' => esc_html__( 'Slides on scroll', 'elementor-pro' ),
			'type' => Controls_Manager::SELECT,
			'options' => [
				'' => esc_html__( 'Default', 'elementor-pro' ),
			] + $slides_on_display,
			'inherit_placeholders' => false,
			'frontend_available' => true,
			'content_classes' => 'elementor-control-field-select-small',
		];

		$this->add_responsive_control(
			'slides_to_scroll',
			$params['slides_to_scroll_custom_settings'] + $slides_to_scroll_shared_settings
		);

		$equal_height_shared_settings = [
			'label' => esc_html__( 'Equal Height', 'elementor-pro' ),
			'type' => Controls_Manager::SWITCHER,
			'label_off' => esc_html__( 'Off', 'elementor-pro' ),
			'label_on' => esc_html__( 'On', 'elementor-pro' ),
			'default' => 'yes',
		];

		$this->add_control(
			'equal_height',
			$params['equal_height_custom_settings'] + $equal_height_shared_settings
		);
	}

	public function add_carousel_settings_controls( $params = [] ) {
		$this->start_controls_section(
			'section_carousel_settings',
			[
				'label' => esc_html__( 'Settings', 'elementor-pro' ),
			]
		);

		$autoplay_shared_settings = [
			'label' => esc_html__( 'Autoplay', 'elementor-pro' ),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
			'options' => [
				'yes' => esc_html__( 'On', 'elementor-pro' ),
				'no' => esc_html__( 'Off', 'elementor-pro' ),
			],
			'frontend_available' => true,
		];

		$this->add_control(
			'autoplay',
			array_key_exists( 'autoplay_custom_settings', $params )
				? $params['autoplay_custom_settings'] + $autoplay_shared_settings
				: $autoplay_shared_settings
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label' => esc_html__( 'Scroll Speed', 'elementor-pro' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => 5000,
				'condition' => [
					'autoplay' => 'yes',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pause_on_hover',
			[
				'label' => esc_html__( 'Pause on hover', 'elementor-pro' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'options' => [
					'yes' => esc_html__( 'On', 'elementor-pro' ),
					'no' => esc_html__( 'Off', 'elementor-pro' ),
				],
				'condition' => [
					'autoplay' => 'yes',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pause_on_interaction',
			[
				'label' => esc_html__( 'Pause on interaction', 'elementor-pro' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'options' => [
					'yes' => esc_html__( 'On', 'elementor-pro' ),
					'no' => esc_html__( 'Off', 'elementor-pro' ),
				],
				'condition' => [
					'autoplay' => 'yes',
				],
				'frontend_available' => true,
			]
		);

		$infinite_shared_settings = [
			'label' => esc_html__( 'Infinite scroll', 'elementor-pro' ),
			'type' => Controls_Manager::SWITCHER,
			'default' => 'yes',
			'options' => [
				'yes' => esc_html__( 'On', 'elementor-pro' ),
				'no' => esc_html__( 'Off', 'elementor-pro' ),
			],
			'frontend_available' => true,
		];

		$this->add_control(
			'infinite',
			array_key_exists( 'infinite_custom_settings', $params )
				? $params['infinite_custom_settings'] + $infinite_shared_settings
				: $infinite_shared_settings
		);

		$this->add_control(
			'speed',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor-pro' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'direction',
			[
				'label' => esc_html__( 'Direction', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'default' => is_rtl() ? 'rtl' : 'ltr',
				'options' => [
					'ltr' => esc_html__( 'Left', 'elementor-pro' ),
					'rtl' => esc_html__( 'Right', 'elementor-pro' ),
				],
			]
		);

		$offset_sides_shared_settings = [
			'label' => esc_html__( 'Offset Sides', 'elementor-pro' ),
			'type' => Controls_Manager::SELECT,
			'default' => 'none',
			'separator' => 'before',
			'frontend_available' => true,
			'condition' => [
				'infinite' => 'yes',
			],
			'options' => [
				'none' => esc_html__( 'None', 'elementor-pro' ),
				'both' => esc_html__( 'Both', 'elementor-pro' ),
				'left' => esc_html__( 'Left', 'elementor-pro' ),
				'right' => esc_html__( 'Right', 'elementor-pro' ),
			],
		];

		$this->add_control(
			'offset_sides',
			array_key_exists( 'offset_sides_custom_settings', $params )
					? $params['offset_sides_custom_settings'] + $offset_sides_shared_settings
					: $offset_sides_shared_settings
		);

		$this->add_responsive_control(
			'offset_width',
			[
				'label' => esc_html__( 'Offset Width', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'frontend_available' => true,
				'condition' => [
					'offset_sides!' => 'none',
					'infinite' => 'yes',
				],
				'default' => [
					'size' => 80,
				],
			]
		);

		$this->end_controls_section();
	}

	public function add_carousel_navigation_controls( $params = [] ) {
		$navigation_shared_settings = [
			'label' => esc_html__( 'Navigation', 'elementor-pro' ),
		];

		$this->start_controls_section(
			'section_navigation_settings',
			array_key_exists( 'navigation_custom_settings', $params )
				? $params['navigation_custom_settings'] + $navigation_shared_settings
				: $navigation_shared_settings
		);

		$this->add_control(
			'arrows',
			[
				'label' => esc_html__( 'Arrows', 'elementor-pro' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'elementor-pro' ),
				'label_on' => esc_html__( 'Show', 'elementor-pro' ),
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'heading_previous_arrow',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Previous Arrow', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'navigation_previous_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor-pro' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => [
					'inline' => [
						'icon' => [
							'icon' => 'eicon-star',
						],
					],
				],
				'recommended' => [
					'fa-regular' => [
						'arrow-alt-circle-left',
						'caret-square-left',
					],
					'fa-solid' => [
						'angle-double-left',
						'angle-left',
						'arrow-alt-circle-left',
						'arrow-circle-left',
						'arrow-left',
						'caret-left',
						'caret-square-left',
						'chevron-circle-left',
						'chevron-left',
						'long-arrow-alt-left',
					],
				],
				'condition' => [
					'arrows' => 'yes',
				],
				'default' => [
					'value' => 'eicon-chevron-left',
					'library' => 'eicons',
				],
			]
		);

		$this->add_control(
			'heading_previous_arrow_horizontal',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Horizontal', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_previous_icon_horizontal_orientation',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => $this->get_arrows_horizontal_navigation_controls(),
				'default' => 'start',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $params['css_prefix'] . 'arrow-prev-left-align: 0%;--' . $params['css_prefix'] . 'arrow-prev-translate-x: 0px;',
					'center' => '--' . $params['css_prefix'] . 'arrow-prev-left-align: 50%;--' . $params['css_prefix'] . 'arrow-prev-translate-x: -50%;',
					'end' => '--' . $params['css_prefix'] . 'arrow-prev-left-align: 100%;--' . $params['css_prefix'] . 'arrow-prev-translate-x: -100%;',
				],
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_previous_icon_horizontal_position',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'arrow-prev-left-position: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					'arrows' => 'yes',
				],
			] )
		);

		$this->add_control(
			'heading_previous_arrow_vertical',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Vertical', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_previous_icon_vertical_orientation',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor-pro' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor-pro' ),
						'icon' => 'eicon-v-align-middle',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor-pro' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $params['css_prefix'] . 'arrow-prev-top-align: 0%; --' . $params['css_prefix'] . 'arrow-prev-caption-spacing: 0px;--' . $params['css_prefix'] . 'arrow-prev-translate-y: 0px;',
					'center' => '--' . $params['css_prefix'] . 'arrow-prev-top-align: 50%;--' . $params['css_prefix'] . 'arrow-prev-translate-y: -50%;',
					'end' => '--' . $params['css_prefix'] . 'arrow-prev-top-align: 100%;--' . $params['css_prefix'] . 'arrow-prev-translate-y: -100%;',
				],
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_previous_icon_vertical_position',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'arrow-prev-top-position: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					'arrows' => 'yes',
				],
				'separator' => 'after',
			] )
		);

		$this->add_control(
			'heading_next_arrow',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Next Arrow', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_control(
			'navigation_next_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor-pro' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => [
					'inline' => [
						'icon' => [
							'icon' => 'eicon-star',
						],
					],
				],
				'recommended' => [
					'fa-regular' => [
						'arrow-alt-circle-right',
						'caret-square-right',
					],
					'fa-solid' => [
						'angle-double-right',
						'angle-right',
						'arrow-alt-circle-right',
						'arrow-circle-right',
						'arrow-right',
						'caret-right',
						'caret-square-right',
						'chevron-circle-right',
						'chevron-right',
						'long-arrow-alt-right',
					],
				],
				'condition' => [
					'arrows' => 'yes',
				],
				'default' => [
					'value' => 'eicon-chevron-right',
					'library' => 'eicons',
				],
			]
		);

		$this->add_control(
			'heading_next_arrow_horizontal',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Horizontal', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_next_icon_horizontal_orientation',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => $this->get_arrows_horizontal_navigation_controls(),
				'default' => 'end',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $params['css_prefix'] . 'arrow-next-right-align: 100%;--' . $params['css_prefix'] . 'arrow-next-translate-x: 100%;',
					'center' => '--' . $params['css_prefix'] . 'arrow-next-right-align: 50%;--' . $params['css_prefix'] . 'arrow-next-translate-x: 50%;',
					'end' => '--' . $params['css_prefix'] . 'arrow-next-right-align: 0%;--' . $params['css_prefix'] . 'arrow-next-translate-x: 0%;',
				],
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_next_icon_horizontal_position',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'arrow-next-right-position: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					'arrows' => 'yes',
				],
			] )
		);

		$this->add_control(
			'heading_next_arrow_vertical',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Vertical', 'elementor-pro' ),
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_next_icon_vertical_orientation',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor-pro' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor-pro' ),
						'icon' => 'eicon-v-align-middle',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor-pro' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $params['css_prefix'] . 'arrow-next-top-align: 0%; --' . $params['css_prefix'] . 'arrow-next-caption-spacing: 0px;--' . $params['css_prefix'] . 'arrow-next-translate-y: 0px;',
					'center' => '--' . $params['css_prefix'] . 'arrow-next-top-align: 50%;--' . $params['css_prefix'] . 'arrow-next-translate-y: -50%;',
					'end' => '--' . $params['css_prefix'] . 'arrow-next-top-align: 100%;--' . $params['css_prefix'] . 'arrow-next-translate-y: -100%;',
				],
				'condition' => [
					'arrows' => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			'navigation_next_icon_vertical_position',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'arrow-next-top-position: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					'arrows' => 'yes',
				],
			] )
		);

		$this->end_controls_section();
	}

	public function add_carousel_navigation_styling_controls( $params = [] ) {
		$navigation_styling_shared_settings = [
			'label' => esc_html__( 'Navigation', 'elementor-pro' ),
			'tab' => Controls_Manager::TAB_STYLE,
		];

		$this->start_controls_section(
			'section_design_navigation',
			array_key_exists( 'navigation_styling_custom_settings', $params )
				? $params['navigation_styling_custom_settings'] + $navigation_styling_shared_settings
				: $navigation_styling_shared_settings
		);

		$this->add_control(
			'heading_icons',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Icons', 'elementor-pro' ),
			]
		);

		$this->add_responsive_control(
			'arrows_size',
			[
				'label' => esc_html__( 'Size', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 5,
						'max' => 400,
					],
					'em' => [
						'min' => 0.1,
						'max' => 10,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
					'rem' => [
						'min' => 0.1,
						'max' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'arrow-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->start_controls_tabs( 'arrows_colors_border_shadow' );

		foreach ( array( 'normal', 'hover' ) as $state ) {
			$this->add_navigation_state_based_style_controls( $state, $params['css_prefix'] );
		}

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'arrows_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor-pro' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} :is(.elementor-swiper-button-prev, .elementor-swiper-button-next) ' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'range' => [
					'em' => [
						'min' => 0,
						'max' => 5,
						'step' => 0.1,
					],
					'rem' => [
						'min' => 0,
						'max' => 5,
						'step' => 0.1,
					],
					'px' => [
						'min' => 0,
						'max' => 50,
						'step' => 1,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
						'step' => 1,
					],
				],
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'arrows_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor-pro' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} :is(.elementor-swiper-button-prev, .elementor-swiper-button-next) ' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'arrows_position',
			[
				'label' => esc_html__( 'Position', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'inside',
				'options' => [
					'inside' => esc_html__( 'Inside', 'elementor-pro' ),
					'outside' => esc_html__( 'Outside', 'elementor-pro' ),
				],
				'prefix_class' => 'elementor-arrows-position-',
				'condition' => [
					'arrows' => 'yes',
				],
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}

	public function add_carousel_pagination_controls( $params = [] ) {
		$pagination_shared_settings = [
			'label' => esc_html__( 'Pagination', 'elementor-pro' ),
		];

		$this->start_controls_section(
			'section_carousel_pagination',
			array_key_exists( 'section_carousel_pagination', $params )
				? $params['section_carousel_pagination'] + $pagination_shared_settings
				: $pagination_shared_settings
		);

		$this->add_control(
			'pagination',
			[
				'label' => esc_html__( 'Pagination', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'bullets',
				'options' => [
					'' => esc_html__( 'None', 'elementor-pro' ),
					'bullets' => esc_html__( 'Dots', 'elementor-pro' ),
					'fraction' => esc_html__( 'Fraction', 'elementor-pro' ),
					'progressbar' => esc_html__( 'Progress', 'elementor-pro' ),
				],
				'prefix_class' => 'elementor-pagination-type-',
				'render_type' => 'template',
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();
	}

	public function add_carousel_pagination_style_controls( $params ) {
		$this->start_controls_section(
			'section_pagination_design',
			[
				'label' => esc_html__( 'Pagination', 'elementor-pro' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'pagination!' => '',
				],
			]
		);

		$this->add_control(
			'heading_pagination_dots',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Dots', 'elementor-pro' ),
				'condition' => [
					'pagination' => 'bullets',
				],
			]
		);

		$this->add_responsive_control(
			'dots_size',
			[
				'label' => esc_html__( 'Size', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 5,
						'max' => 200,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-size: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'pagination' => 'bullets',
				],
			]
		);

		$this->start_controls_tabs( 'dots_colors' );

		$this->start_controls_tab( 'dots_normal_colors', [
			'label' => esc_html__( 'Normal', 'elementor-pro' ),
			'condition' => [
				'pagination' => 'bullets',
			],
		] );

		$this->add_control(
			'dots_normal_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'dots-normal-color: {{VALUE}};',
				],
				'condition' => [
					'pagination' => 'bullets',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'dots_hover_colors', [
			'label' => esc_html__( 'Hover', 'elementor-pro' ),
			'condition' => [
				'pagination' => 'bullets',
			],
		] );

		$this->add_control(
			'dots_hover_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'dots-hover-color: {{VALUE}};',
				],
				'condition' => [
					'pagination' => 'bullets',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_custom_pagination( $params['css_prefix'], 'dots' );

		$this->add_control(
			'dots_position',
			[
				'label' => esc_html__( 'Space From slides', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'outside',
				'options' => [
					'inside' => esc_html__( 'None', 'elementor-pro' ),
					'outside' => esc_html__( 'Custom', 'elementor-pro' ),
				],
				'prefix_class' => 'elementor-pagination-position-',
				'condition' => [
					'pagination' => 'bullets',
				],
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'dots_pagination_spacing',
			[
				'label' => esc_html__( 'Spacing', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'max' => 100,
					],
				],
				'conditions' => [
					'relation' => 'and',
					'terms' => [
						[
							'name' => 'pagination',
							'operator' => '==',
							'value' => 'bullets',
						],
						[
							'name' => 'dots_position',
							'operator' => '==',
							'value' => 'outside',
						],
					],

				],
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-spacing: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'heading_pagination_fraction',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Fraction', 'elementor-pro' ),
				'condition' => [
					'pagination' => 'fraction',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography_fraction',
				'selector' => '{{WRAPPER}} .swiper-pagination',
				'condition' => [
					'pagination' => 'fraction',
				],
				'fields_options' => [
					'font_size' => [
						'selectors' => [
							'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-size: {{SIZE}}{{UNIT}};',
							'{{WRAPPER}} .swiper-pagination' => 'font-size: {{SIZE}}{{UNIT}};',
						],
					],
					'line_height' => [
						'selectors' => [
							'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-size: {{SIZE}}{{UNIT}};',
							'{{WRAPPER}} .swiper-pagination' => 'line-height: {{SIZE}}{{UNIT}};',
						],
					],
				],
			]
		);

		$this->add_control(
			'fraction_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'fraction-color: {{VALUE}};',
				],
				'condition' => [
					'pagination' => 'fraction',
				],
			]
		);

		$this->add_custom_pagination( $params['css_prefix'], 'fraction' );

		$this->add_control(
			'fraction_position',
			[
				'label' => esc_html__( 'Space From slides', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'outside',
				'options' => [
					'inside' => esc_html__( 'None', 'elementor-pro' ),
					'outside' => esc_html__( 'Custom', 'elementor-pro' ),
				],
				'prefix_class' => 'elementor-pagination-position-',
				'condition' => [
					'pagination' => 'fraction',
				],
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'fraction_pagination_spacing',
			[
				'label' => esc_html__( 'Spacing', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'max' => 100,
					],
				],
				'conditions' => [
					'relation' => 'and',
					'terms' => [
						[
							'name' => 'pagination',
							'operator' => '==',
							'value' => 'fraction',
						],
						[
							'name' => 'fraction_position',
							'operator' => '==',
							'value' => 'outside',
						],
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-spacing: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'heading_pagination_progress',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Progress Bar', 'elementor-pro' ),
				'condition' => [
					'pagination' => 'progressbar',
				],
			]
		);

		$this->add_responsive_control(
			'progressbar_height',
			[
				'label' => esc_html__( 'Height', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'vh', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 200,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'swiper-pagination-size: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'pagination' => 'progressbar',
				],
			]
		);

		$this->start_controls_tabs( 'progressbar_colors' );

		$this->start_controls_tab( 'progressbar_normal_colors', [
			'label' => esc_html__( 'Normal', 'elementor-pro' ),
			'condition' => [
				'pagination' => 'progressbar',
			],
		] );

		$this->add_control(
			'progressbar_normal_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'progressbar-normal-color: {{VALUE}};',
				],
				'condition' => [
					'pagination' => 'progressbar',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab( 'progressbar_hover_colors', [
			'label' => esc_html__( 'Hover', 'elementor-pro' ),
			'condition' => [
				'pagination' => 'progressbar',
			],
		] );

		$this->add_control(
			'progressbar_hover_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $params['css_prefix'] . 'progressbar-hover-color: {{VALUE}};',
				],
				'condition' => [
					'pagination' => 'progressbar',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	public function render_carousel_footer( $settings ) { ?>
		<?php if ( 'yes' === $settings['arrows'] && 1 < $settings['posts_per_page'] ) : ?>
			<div class="elementor-swiper-button elementor-swiper-button-prev" role="button" tabindex="0">
				<?php $this->render_swiper_button( 'previous' ); ?>
			</div>
			<div class="elementor-swiper-button elementor-swiper-button-next" role="button" tabindex="0">
				<?php $this->render_swiper_button( 'next' ); ?>
			</div>
		<?php endif;

		if ( $settings['pagination'] && 1 < $settings['posts_per_page'] ) : ?>
			<div class="swiper-pagination"></div>
		<?php endif;
	}

	private function render_swiper_button( $type ) {
		$icon_settings = $this->get_settings_for_display( 'navigation_' . $type . '_icon' );

		if ( empty( $icon_settings['value'] ) ) {
			return;
		}

		Icons_Manager::render_icon( $icon_settings, [ 'aria-hidden' => 'true' ] );
	}

	/**
	 * @param string $state
	 * @param $css_prefix
	 * @return void
	 */
	private function add_navigation_state_based_style_controls( string $state, $css_prefix ) {
		$label = esc_html__( 'Normal', 'elementor-pro' );
		$selector = '{{WRAPPER}} :is(.elementor-swiper-button-prev, .elementor-swiper-button-next) ';
		if ( 'hover' === $state ) {
			$label = esc_html__( 'Hover', 'elementor-pro' );
			$selector = '{{WRAPPER}} :is(.elementor-swiper-button-prev:hover, .elementor-swiper-button-next:hover) ';
		}
		$this->start_controls_tab('arrows_' . $state . '_colors_border_shadow_tab', [
			'label' => $label,
		]);

		$this->add_control(
			'arrow_' . $state . '_color',
			[
				'label' => esc_html__( 'Color', 'elementor-pro' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--' . $css_prefix . 'arrow-' . $state . '-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'arrows_' . $state . '_background',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => $selector,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'arrows_' . $state . '_border_type',
				'selector' => $selector,
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor-pro' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor-pro' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'arrows_' . $state . '_box_shadow',
				'selector' => $selector,
			]
		);

		$this->end_controls_tab();
	}

	/**
	 * @param string $css_prefix
	 * @param string $pagination_type
	 *
	 * @return void
	 */
	private function add_custom_pagination( string $css_prefix, string $pagination_type ) {
		$start_logical = is_rtl() ? 'right' : 'left';
		$end_logical = is_rtl() ? 'left' : 'right';
		$condition = 'dots' === $pagination_type ? 'bullets' : $pagination_type;
		$pagination_type_custom_position_switcher = $pagination_type . '_custom_position';

		$this->add_control(
			$pagination_type_custom_position_switcher,
			[
				'label' => esc_html__( 'Custom Position', 'elementor-pro' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Hide', 'elementor-pro' ),
				'label_on' => esc_html__( 'Show', 'elementor-pro' ),
				'condition' => [
					'pagination' => $condition,
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'heading_' . $pagination_type . '_pagination_horizontal',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Horizontal', 'elementor-pro' ),
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
				],
			]
		);

		$this->add_responsive_control(
			$pagination_type . '_horizontal_position',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor-pro' ),
						'icon' => 'eicon-h-align-' . $start_logical,
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor-pro' ),
						'icon' => 'eicon-h-align-center',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor-pro' ),
						'icon' => 'eicon-h-align-' . $end_logical,
					],
				],
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $css_prefix . $pagination_type . '-horizontal-position:0px;--' . $css_prefix . $pagination_type . '-horizontal-transform:0%;',
					'center' => '--' . $css_prefix . $pagination_type . '-horizontal-position:50%;--' . $css_prefix . $pagination_type . '-horizontal-transform:-50%;',
					'end' => '--' . $css_prefix . $pagination_type . '-horizontal-position:100%;--' . $css_prefix . $pagination_type . '-horizontal-transform:-100%;',
				],
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
					'pagination' => $condition,
				],
			]
		);

		$this->add_responsive_control(
			$pagination_type . '_horizontal_offset',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $css_prefix . $pagination_type . '-horizontal-offset: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
					'pagination' => $condition,
				],
			] )
		);

		$this->add_control(
			'heading_' . $pagination_type . 'pagination_vertical',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Vertical', 'elementor-pro' ),
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
					'pagination' => $condition,
				],
			]
		);

		$this->add_responsive_control(
			$pagination_type . '_vertical_position',
			[
				'label' => esc_html__( 'Orientation', 'elementor-pro' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor-pro' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor-pro' ),
						'icon' => 'eicon-v-align-middle',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor-pro' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'default' => 'end',
				'selectors' => [
					'{{WRAPPER}}' => '{{VALUE}}',
				],
				'selectors_dictionary' => [
					'start' => '--' . $css_prefix . $pagination_type . '-vertical-position: 0%;--' . $css_prefix . $pagination_type . '-vertical-transform: 0%;',
					'center' => '--' . $css_prefix . $pagination_type . '-vertical-position: 50%;--' . $css_prefix . $pagination_type . '-vertical-transform: -50%;',
					'end' => '--' . $css_prefix . $pagination_type . '-vertical-position: 100%;--' . $css_prefix . $pagination_type . '-vertical-transform: -100%;',
				],
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
					'pagination' => $condition,
				],
			]
		);

		$this->add_responsive_control(
			$pagination_type . '_vertical_offset',
			array_merge( $this->get_position_slider_initial_configuration(), [
				'selectors' => [
					'{{WRAPPER}}' => '--' . $css_prefix . $pagination_type . '-vertical-offset: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 0,
				],
				'condition' => [
					$pagination_type_custom_position_switcher => 'yes',
					'pagination' => $condition,
				],
				'separator' => 'after',
			] )
		);
	}

	/**
	 * @return array
	 */
	private function get_position_slider_initial_configuration(): array {
		return [
			'label' => esc_html__( 'Position', 'elementor-pro' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ],
			'range' => [
				'px' => [
					'min' => -1000,
					'max' => 1000,
				],
				'%' => [
					'min' => -200,
					'max' => 200,
				],
				'em' => [
					'min' => -50,
					'max' => 50,
				],
				'rem' => [
					'min' => -50,
					'max' => 50,
				],
				'vw' => [
					'min' => -200,
					'max' => 200,
				],
				'vh' => [
					'min' => -200,
					'max' => 200,
				],
			],
		];
	}

	/**
	 * @return array[]
	 */
	private function get_arrows_horizontal_navigation_controls(): array {
		$navigation_controls = [
			'start' => [
				'title' => is_rtl() ? esc_html__( 'End', 'elementor-pro' ) : esc_html__( 'Start', 'elementor-pro' ),
				'icon' => 'eicon-h-align-left',
			],
			'center' => [
				'title' => esc_html__( 'Center', 'elementor-pro' ),
				'icon' => 'eicon-h-align-center',
			],
			'end' => [
				'title' => is_rtl() ? esc_html__( 'Start', 'elementor-pro' ) : esc_html__( 'End', 'elementor-pro' ),
				'icon' => 'eicon-h-align-right',
			],
		];

		return is_rtl() ? array_reverse( $navigation_controls ) : $navigation_controls;
	}
}
