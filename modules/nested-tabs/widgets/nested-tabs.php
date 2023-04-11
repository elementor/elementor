<?php
namespace Elementor\Modules\NestedTabs\Widgets;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Background;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;
use Elementor\Group_Control_Text_Shadow;
use Elementor\Group_Control_Text_Stroke;
use Elementor\Group_Control_Typography;
use Elementor\Icons_Manager;
use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
use Elementor\Modules\NestedElements\Controls\Control_Nested_Repeater;
use Elementor\Plugin;
use Elementor\Repeater;
use Elementor\Modules\DynamicTags\Module as TagsModule;
use Elementor\Utils;
use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class NestedTabs extends Widget_Nested_Base {

	public function get_name() {
		return 'nested-tabs';
	}

	public function get_title() {
		return esc_html__( 'Tabs', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-tabs';
	}

	public function get_keywords() {
		return [ 'nested', 'tabs', 'accordion', 'toggle' ];
	}

	protected function tab_content_container( int $index ) {
		return [
			'elType' => 'container',
			'settings' => [
				'_title' => sprintf( __( 'Tab #%s', 'elementor' ), $index ),
				'content_width' => 'full',
			],
		];
	}

	protected function get_default_children_elements() {
		return [
			$this->tab_content_container( 1 ),
			$this->tab_content_container( 2 ),
			$this->tab_content_container( 3 ),
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'tab_title';
	}

	protected function get_default_children_title() {
		return esc_html__( 'Tab #%d', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.e-n-tabs-content';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-n-tabs';
	}

	protected function register_controls() {
		$start = is_rtl() ? 'right' : 'left';
		$end = is_rtl() ? 'left' : 'right';
		$tooltip_start = is_rtl() ? esc_html__( 'Right', 'elementor' ) : esc_html__( 'Left', 'elementor' );
		$tooltip_end = is_rtl() ? esc_html__( 'Left', 'elementor' ) : esc_html__( 'Right', 'elementor' );
		$nested_tabs_heading_selector_class = ':is( {{WRAPPER}} > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading, {{WRAPPER}} > .elementor-widget-container > .e-n-tabs > .e-n-tabs-content )';
		$nested_tabs_content_selector_class = ':where( {{WRAPPER}} > .elementor-widget-container > .e-n-tabs > .e-n-tabs-content ) > .e-con';

		$this->start_controls_section( 'section_tabs', [
			'label' => esc_html__( 'Tabs', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control( 'tab_title', [
			'label' => esc_html__( 'Title', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => esc_html__( 'Tab Title', 'elementor' ),
			'placeholder' => esc_html__( 'Tab Title', 'elementor' ),
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		] );

		$repeater->add_control(
			'tab_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
			]
		);

		$repeater->add_control(
			'tab_icon_active',
			[
				'label' => esc_html__( 'Active Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'condition' => [
					'tab_icon[value]!' => '',
				],
			]
		);

		$repeater->add_control(
			'element_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
				'classes' => 'elementor-control-direction-ltr',
			]
		);

		$this->add_control( 'tabs', [
			'label' => esc_html__( 'Tabs Items', 'elementor' ),
			'type' => Control_Nested_Repeater::CONTROL_TYPE,
			'fields' => $repeater->get_controls(),
			'default' => [
				[
					'tab_title' => esc_html__( 'Tab #1', 'elementor' ),
				],
				[
					'tab_title' => esc_html__( 'Tab #2', 'elementor' ),
				],
				[
					'tab_title' => esc_html__( 'Tab #3', 'elementor' ),
				],
			],
			'title_field' => '{{{ tab_title }}}',
			'button_text' => 'Add Tab',
		] );

		$this->add_responsive_control( 'tabs_direction', [
			'label' => esc_html__( 'Direction', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'top' => [
					'title' => esc_html__( 'Top', 'elementor' ),
					'icon' => 'eicon-v-align-top',
				],
				'bottom' => [
					'title' => esc_html__( 'Bottom', 'elementor' ),
					'icon' => 'eicon-v-align-bottom',
				],
				'end' => [
					'title' => $tooltip_end,
					'icon' => 'eicon-h-align-' . $end,
				],
				'start' => [
					'title' => $tooltip_start,
					'icon' => 'eicon-h-align-' . $start,
				],
			],
			'separator' => 'before',
			'selectors_dictionary' => [
				'top' => '--n-tabs-direction: column; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
				'bottom' => '--n-tabs-direction: column-reverse; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
				'end' => '--n-tabs-direction: row-reverse; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
				'start' => '--n-tabs-direction: row; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
		] );

		$this->add_responsive_control( 'tabs_justify_horizontal', [
			'label' => esc_html__( 'Justify', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-h',
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-h-align-center',
				],
				'end' => [
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-h',
				],
				'stretch' => [
					'title' => esc_html__( 'Justified', 'elementor' ),
					'icon' => 'eicon-h-align-stretch',
				],
			],
			'selectors_dictionary' => [
				'start' => '--n-tabs-heading-justify-content: flex-start; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: center;',
				'center' => '--n-tabs-heading-justify-content: center; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: center;',
				'end' => '--n-tabs-heading-justify-content: flex-end; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: center',
				'stretch' => '--n-tabs-heading-justify-content: initial; --n-tabs-title-width: 100%; --n-tabs-title-height: initial; --n-tabs-title-align-items: center;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
			'condition' => [
				'tabs_direction' => [
					'',
					'top',
					'bottom',
				],
			],
		] );

		$this->add_responsive_control( 'tabs_justify_vertical', [
			'label' => esc_html__( 'Justify', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-start-v',
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-v-align-middle',
				],
				'end' => [
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => 'eicon-flex eicon-align-end-v',
				],
				'stretch' => [
					'title' => esc_html__( 'Justified', 'elementor' ),
					'icon' => 'eicon-v-align-stretch',
				],
			],
			'selectors_dictionary' => [
				'start' => '--n-tabs-heading-justify-content: flex-start; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: initial;',
				'center' => '--n-tabs-heading-justify-content: center; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: initial;',
				'end' => '--n-tabs-heading-justify-content: flex-end; --n-tabs-title-width: initial; --n-tabs-title-height: initial; --n-tabs-title-align-items: initial;',
				'stretch' => '--n-tabs-heading-justify-content: flex-start; --n-tabs-title-width: initial; --n-tabs-title-height: 100%; --n-tabs-title-align-items: center;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
			'condition' => [
				'tabs_direction' => [
					'start',
					'end',
				],
			],
		] );

		$this->add_responsive_control( 'tabs_width', [
			'label' => esc_html__( 'Width', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'%' => [
					'min' => 10,
					'max' => 50,
				],
				'px' => [
					'min' => 20,
					'max' => 600,
				],
			],
			'default' => [
				'unit' => '%',
			],
			'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-heading-width: {{SIZE}}{{UNIT}}',
			],
			'condition' => [
				'tabs_direction' => [
					'start',
					'end',
				],
			],
		] );

		$this->add_responsive_control( 'title_alignment', [
			'label' => esc_html__( 'Align Title', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html__( 'Left', 'elementor' ),
					'icon' => 'eicon-text-align-left',
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-text-align-center',
				],
				'end' => [
					'title' => esc_html__( 'Right', 'elementor' ),
					'icon' => 'eicon-text-align-right',
				],
			],
			'selectors_dictionary' => [
				'start' => '--n-tabs-title-justify-content: flex-start; --n-tabs-title-align-items: flex-start;',
				'center' => '--n-tabs-title-justify-content: center; --n-tabs-title-align-items: center;',
				'end' => '--n-tabs-title-justify-content: flex-end; --n-tabs-title-align-items: flex-end;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
		] );

		$this->end_controls_section();

		$this->start_controls_section( 'section_tabs_responsive', [
			'label' => esc_html__( 'Responsive Settings', 'elementor' ),
		] );

		$dropdown_options = [];
		$excluded_breakpoints = [
			'laptop',
			'tablet_extra',
			'widescreen',
		];

		foreach ( Plugin::$instance->breakpoints->get_active_breakpoints() as $breakpoint_key => $breakpoint_instance ) {
			// Exclude the larger breakpoints from the dropdown selector.
			if ( in_array( $breakpoint_key, $excluded_breakpoints, true ) ) {
				continue;
			}

			$dropdown_options[ $breakpoint_key ] = sprintf(
				/* translators: 1: Breakpoint label, 2: `>` character, 3: Breakpoint value. */
				esc_html__( '%1$s (%2$s %3$dpx)', 'elementor' ),
				$breakpoint_instance->get_label(),
				'>',
				$breakpoint_instance->get_value()
			);
		}

		$this->add_control(
			'breakpoint_selector',
			[
				'label' => esc_html__( 'Breakpoint', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => esc_html__( 'Note: Choose at which breakpoint tabs will automatically switch to a vertical (“accordion”) layout.', 'elementor' ),
				'options' => $dropdown_options,
				'default' => 'mobile',
				'prefix_class' => 'e-n-tabs-',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section( 'section_tabs_style', [
			'label' => esc_html__( 'Tabs', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_responsive_control( 'tabs_title_space_between', [
			'label' => esc_html__( 'Gap between tabs', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 400,
				],
			],
			'size_units' => [ 'px' ],
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-title-gap: {{SIZE}}{{UNIT}}',
			],
		] );

		$this->add_responsive_control( 'tabs_title_spacing', [
			'label' => esc_html__( 'Distance from content', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 400,
				],
			],
			'size_units' => [ 'px' ],
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-gap: {{SIZE}}{{UNIT}}',
			],
		] );

		$this->start_controls_tabs( 'tabs_title_style' );

		$this->start_controls_tab(
			'tabs_title_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'tabs_title_background_color',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => ':is( {{WRAPPER}} > .elementor-widget-container > .e-n-tabs > .e-n-tabs-heading > .e-n-tab-title:not( .e-active ):not( :hover ), {{WRAPPER}} > .elementor-widget-container > .e-n-tabs > .e-n-tabs-content > .e-n-tab-title:not( .e-active ) )',
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Background Color', 'elementor' ),
						'selectors' => [
							'{{SELECTOR}}' => 'background: {{VALUE}}',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'tabs_title_border',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title:not( .e-active ):not( :hover )",
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'tabs_title_box_shadow',
				'label' => esc_html__( 'Shadow', 'elementor' ),
				'separator' => 'after',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title:not( .e-active ):not( :hover )",
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tabs_title_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'tabs_title_background_color_hover',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => "{$nested_tabs_heading_selector_class} > .e-normal:not( .e-active ):hover",
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
					'color' => [
						'global' => [
							'default' => Global_Colors::COLOR_ACCENT,
						],
						'label' => esc_html__( 'Background Color', 'elementor' ),
						'selectors' => [
							'{{SELECTOR}}' => 'background: {{VALUE}};',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'tabs_title_border_hover',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-normal:not( .e-active ):hover",
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'tabs_title_box_shadow_hover',
				'label' => esc_html__( 'Shadow', 'elementor' ),
				'separator' => 'after',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-normal:not( .e-active ):hover",
			]
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->add_control(
			'tabs_title_transition_duration',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}}' => '--n-tabs-title-transition: {{SIZE}}s',
				],
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tabs_title_active',
			[
				'label' => esc_html__( 'Active', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'tabs_title_background_color_active',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title.e-active",
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
					'color' => [
						'global' => [
							'default' => Global_Colors::COLOR_ACCENT,
						],
						'label' => esc_html__( 'Background Color', 'elementor' ),
						'selectors' => [
							'{{SELECTOR}}' => 'background: {{VALUE}};',
						],
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'tabs_title_border_active',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title.e-active",
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'tabs_title_box_shadow_active',
				'label' => esc_html__( 'Shadow', 'elementor' ),
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title.e-active",
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->add_responsive_control(
			'tabs_title_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'separator' => 'before',
				'selectors' => [
					'{{WRAPPER}}' => '--n-tabs-title-border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}}' => '--n-tabs-title-padding-top: {{TOP}}{{UNIT}}; --n-tabs-title-padding-right: {{RIGHT}}{{UNIT}}; --n-tabs-title-padding-bottom: {{BOTTOM}}{{UNIT}}; --n-tabs-title-padding-left: {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section( 'section_title_style', [
			'label' => esc_html__( 'Titles', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_group_control( Group_Control_Typography::get_type(), [
			'name' => 'title_typography',
			'global' => [
				'default' => Global_Typography::TYPOGRAPHY_ACCENT,
			],
			'selector' => "{$nested_tabs_heading_selector_class} > :is( .e-n-tab-title > .e-n-tab-title-text, .e-n-tab-title )",
			'fields_options' => [
				'font_size' => [
					'selectors' => [
						'{{WRAPPER}}' => '--n-tabs-title-font-size: {{SIZE}}{{UNIT}}',
					],
				],
			],
		] );

		$this->start_controls_tabs( 'title_style' );

		$this->start_controls_tab(
			'title_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'title_text_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--n-tabs-title-color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_text_shadow',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title:not( .e-active ):not( :hover )",
				'fields_options' => [
					'text_shadow_type' => [
						'label' => esc_html_x( 'Shadow', 'Text Shadow Control', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			[
				'name' => 'title_text_stroke',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title:not( .e-active ):not( :hover ) :is( span, a, i )",
				'fields_options' => [
					'text_stroke_type' => [
						'label' => esc_html__( 'Stroke', 'elementor' ),
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'title_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'title_text_color_hover',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-normal:not( .e-active ):hover' => '--n-tabs-title-color-hover: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_text_shadow_hover',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-normal:not( .e-active ):hover",
				'fields_options' => [
					'text_shadow_type' => [
						'label' => esc_html_x( 'Shadow', 'Text Shadow Control', 'elementor' ),
					],
				],

			]
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			[
				'name' => 'title_text_stroke_hover',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-normal:not( .e-active ):hover :is( span, a, i )",
				'fields_options' => [
					'text_stroke_type' => [
						'label' => esc_html__( 'Stroke', 'elementor' ),
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'title_active',
			[
				'label' => esc_html__( 'Active', 'elementor' ),
			]
		);

		$this->add_control(
			'title_text_color_active',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}}' => '--n-tabs-title-color-active: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_text_shadow_active',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title.e-active",
				'fields_options' => [
					'text_shadow_type' => [
						'label' => esc_html_x( 'Shadow', 'Text Shadow Control', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			[
				'name' => 'title_text_stroke_active',
				'selector' => "{$nested_tabs_heading_selector_class} > .e-n-tab-title.e-active :is( span, a, i )",
				'fields_options' => [
					'text_stroke_type' => [
						'label' => esc_html__( 'Stroke', 'elementor' ),
					],
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		$this->start_controls_section( 'icon_section_style', [
			'label' => esc_html__( 'Icon', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_responsive_control( 'icon_position', [
			'label' => esc_html__( 'Position', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'top' => [
					'title' => esc_html__( 'Top', 'elementor' ),
					'icon' => 'eicon-v-align-top',
				],
				'end' => [
					'title' => $tooltip_end,
					'icon' => 'eicon-h-align-' . $end,
				],
				'bottom' => [
					'title' => esc_html__( 'Bottom', 'elementor' ),
					'icon' => 'eicon-v-align-bottom',
				],
				'start' => [
					'title' => $tooltip_start,
					'icon' => 'eicon-h-align-' . $start,
				],
			],
			'selectors_dictionary' => [
				// The toggle variables for 'align items' and 'justify content' have been added to separate the styling of the two 'flex direction' modes.
				'top' => '--n-tabs-title-direction: column; --n-tabs-icon-order: initial; --n-tabs-title-justify-content-toggle: center; --n-tabs-title-align-items-toggle: initial;',
				'end' => '--n-tabs-title-direction: row; --n-tabs-icon-order: 1; --n-tabs-title-justify-content-toggle: initial; --n-tabs-title-align-items-toggle: center;',
				'bottom' => '--n-tabs-title-direction: column; --n-tabs-icon-order: 1; --n-tabs-title-justify-content-toggle: center; --n-tabs-title-align-items-toggle: initial;',
				'start' => '--n-tabs-title-direction: row; --n-tabs-icon-order: initial; --n-tabs-title-justify-content-toggle: initial; --n-tabs-title-align-items-toggle: center;',
			],
			'selectors' => [
				'{{WRAPPER}}' => '{{VALUE}}',
			],
		] );

		$this->add_responsive_control( 'icon_size', [
			'label' => esc_html__( 'Size', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 100,
				],
				'em' => [
					'min' => 0,
					'max' => 10,
					'step' => 0.1,
				],
				'rem' => [
					'min' => 0,
					'max' => 10,
					'step' => 0.1,
				],
			],
			'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ],
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-icon-size: {{SIZE}}{{UNIT}}',
			],
		] );

		$this->add_responsive_control( 'icon_spacing', [
			'label' => esc_html__( 'Spacing', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => 0,
					'max' => 400,
				],
				'vw' => [
					'min' => 0,
					'max' => 50,
					'step' => 0.1,
				],
			],
			'size_units' => [ 'px', 'em', 'rem', 'vw', 'custom' ],
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-icon-gap: {{SIZE}}{{UNIT}}',
			],
		] );

		$this->start_controls_tabs( 'icon_style_states' );

		$this->start_controls_tab(
			'icon_section_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_control( 'icon_color', [
			'label' => esc_html__( 'Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-icon-color: {{VALUE}};',
			],
		] );

		$this->end_controls_tab();

		$this->start_controls_tab(
			'icon_section_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_control( 'icon_color_hover', [
			'label' => esc_html__( 'Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}} .e-normal:not( .e-active ):hover' => '--n-tabs-icon-color-hover: {{VALUE}};',
			],
		] );

		$this->end_controls_tab();

		$this->start_controls_tab(
			'icon_section_active',
			[
				'label' => esc_html__( 'Active', 'elementor' ),
			]
		);

		$this->add_control( 'icon_color_active', [
			'label' => esc_html__( 'Color', 'elementor' ),
			'type' => Controls_Manager::COLOR,
			'selectors' => [
				'{{WRAPPER}}' => '--n-tabs-icon-color-active: {{VALUE}};',
			],
		] );

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		$this->start_controls_section( 'section_box_style', [
			'label' => esc_html__( 'Content', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'box_background_color',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				'selector' => $nested_tabs_content_selector_class,
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Background Color', 'elementor' ),
					],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'box_border',
				'selector' => $nested_tabs_content_selector_class,
				'fields_options' => [
					'color' => [
						'label' => esc_html__( 'Border Color', 'elementor' ),
					],
					'width' => [
						'label' => esc_html__( 'Border Width', 'elementor' ),
					],
				],
			]
		);

		$this->add_responsive_control(
			'box_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'selectors' => [
					$nested_tabs_content_selector_class => '--border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow_box_shadow',
				'selector' => $nested_tabs_content_selector_class,
				'condition' => [
					'box_height!' => 'height',
				],
			]
		);

		$this->add_responsive_control(
			'box_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					$nested_tabs_content_selector_class => '--padding-top: {{TOP}}{{UNIT}}; --padding-right: {{RIGHT}}{{UNIT}}; --padding-bottom: {{BOTTOM}}{{UNIT}}; --padding-left: {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		// Copied from tabs.php
		$settings = $this->get_settings_for_display();
		$tabs = $settings['tabs'];

		$id_int = substr( $this->get_id_int(), 0, 3 );

		$a11y_improvements_experiment = Plugin::$instance->experiments->is_feature_active( 'a11y_improvements' );

		if ( ! empty( $settings['link'] ) ) {
			$this->add_link_attributes( 'elementor-tabs', $settings['link'] );
		}

		$this->add_render_attribute( 'elementor-tabs', 'class', 'e-n-tabs' );
		$this->add_render_attribute( 'tab-title-text', 'class', 'e-n-tab-title-text' );
		$this->add_render_attribute( 'tab-icon', 'class', 'e-n-tab-icon' );
		$this->add_render_attribute( 'tab-icon-active', 'class', [ 'e-n-tab-icon', 'e-active' ] );

		$tabs_title_html = '';
		$mobile_tabs_title_html = '';

		foreach ( $tabs as $index => $item ) {
			// Tabs title.
			$tab_count = $index + 1;
			$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );
			$tab_title = $a11y_improvements_experiment ? $item['tab_title'] : '<a href="">' . $item['tab_title'] . '</a>';
			$tab_title_mobile_setting_key = $this->get_repeater_setting_key( 'tab_title_mobile', 'tabs', $tab_count );
			$tab_title_classes = [ 'e-n-tab-title', 'e-normal' ];
			$tab_title_mobile_classes = [ 'e-n-tab-title', 'e-collapse' ];

			if ( $settings['hover_animation'] ) {
				array_push( $tab_title_classes, 'elementor-animation-' . $settings['hover_animation'] );
				array_push( $tab_title_mobile_classes, 'elementor-animation-' . $settings['hover_animation'] );
			}

			$tab_id = empty( $item['element_id'] ) ? 'e-n-tabs-title-' . $id_int . $tab_count : $item['element_id'];

			$this->add_render_attribute( $tab_title_setting_key, [
				'id' => $tab_id,
				'class' => $tab_title_classes,
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'e-n-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
			] );

			$this->add_render_attribute( $tab_title_mobile_setting_key, [
				'class' => $tab_title_mobile_classes,
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'e-n-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
				'id' => $tab_id . '-accordion',
			] );

			$title_render_attributes = $this->get_render_attribute_string( $tab_title_setting_key );
			$mobile_title_attributes = $this->get_render_attribute_string( $tab_title_mobile_setting_key );
			$tab_title_text_class = $this->get_render_attribute_string( 'tab-title-text' );
			$tab_icon_class = $this->get_render_attribute_string( 'tab-icon' );

			$icon_html = Icons_Manager::try_get_icon_html( $item['tab_icon'], [ 'aria-hidden' => 'true' ] );
			$icon_active_html = $icon_html;

			if ( $this->is_active_icon_exist( $item ) ) {
				$icon_active_html = Icons_Manager::try_get_icon_html( $item['tab_icon_active'], [ 'aria-hidden' => 'true' ] );
			}

			$tabs_title_html .= "<div {$title_render_attributes}>";
			$tabs_title_html .= "\t<span {$tab_icon_class}>{$icon_html}{$icon_active_html}</span>";
			$tabs_title_html .= "\t<span {$tab_title_text_class}>{$tab_title}</span>";
			$tabs_title_html .= '</div>';

			// Tabs content.
			ob_start();
			$this->print_child( $index );
			$tab_content = ob_get_clean();

			$mobile_tabs_title_html .= "<div $mobile_title_attributes>";
			$mobile_tabs_title_html .= "\t<span {$tab_icon_class}>{$icon_html}{$icon_active_html}</span>";
			$mobile_tabs_title_html .= "\t<span {$tab_title_text_class}>{$tab_title}</span>";
			$mobile_tabs_title_html .= "</div>$tab_content";
		}
		?>
		<div <?php $this->print_render_attribute_string( 'elementor-tabs' ); ?>>
			<div class="e-n-tabs-heading" role="tablist">
				<?php echo $tabs_title_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="e-n-tabs-content" role="tablist" aria-orientation="vertical">
				<?php echo $mobile_tabs_title_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="e-n-tabs" role="tablist" aria-orientation="vertical">
			<# if ( settings['tabs'] ) {
			const elementUid = view.getIDInt().toString().substr( 0, 3 ); #>
			<div class="e-n-tabs-heading" role="tablist">
				<# _.each( settings['tabs'], function( item, index ) {
				const tabCount = index + 1,
					tabUid = elementUid + tabCount,
					tabWrapperKey = tabUid,
					tabTitleKey = 'tab-title-' + tabUid,
					tabIconKey = 'tab-icon-' + tabUid,
					tabIcon = elementor.helpers.renderIcon( view, item.tab_icon, { 'aria-hidden': true }, 'i' , 'object' ),
					hoverAnimationClass = settings['hover_animation'] ? `elementor-animation-${ settings['hover_animation'] }` : '';

				let tabActiveIcon = tabIcon,
					tabId = 'e-n-tab-title-' + tabUid;

				if ( '' !== item.tab_icon_active.value ) {
					tabActiveIcon = elementor.helpers.renderIcon( view, item.tab_icon_active, { 'aria-hidden': true }, 'i' , 'object' );
				}

				if ( '' !== item.element_id ) {
					tabId = item.element_id;
				}

				view.addRenderAttribute( tabWrapperKey, {
					'id': tabId,
					'class': [ 'e-n-tab-title','e-normal',hoverAnimationClass ],
					'data-tab': tabCount,
					'role': 'tab',
					'tabindex': 1 === tabCount ? '0' : '-1',
					'aria-controls': 'e-n-tab-content-' + tabUid,
					'aria-expanded': 'false',
				} );

				view.addRenderAttribute( tabTitleKey, {
					'class': [ 'e-n-tab-title-text' ],
					'data-binding-type': 'repeater-item',
					'data-binding-repeater-name': 'tabs',
					'data-binding-setting': [ 'tab_title' ],
					'data-binding-index': tabCount,
				} );

				view.addRenderAttribute( tabIconKey, {
					'class': [ 'e-n-tab-icon' ],
					'data-binding-type': 'repeater-item',
					'data-binding-repeater-name': 'tabs',
					'data-binding-setting': [ 'tab_icon.value', 'tab_icon_active.value' ],
					'data-binding-index': tabCount,
				} );
				#>
				<div {{{ view.getRenderAttributeString( tabWrapperKey ) }}}>
					<span {{{ view.getRenderAttributeString( tabIconKey ) }}}>{{{ tabIcon.value }}}{{{ tabActiveIcon.value }}}</span>
					<span {{{ view.getRenderAttributeString( tabTitleKey ) }}}>{{{ item.tab_title }}}</span>
				</div>
				<# } ); #>
			</div>
			<div class="e-n-tabs-content">
			</div>
			<# } #>
		</div>
		<?php
	}

	/**
	 * @param $item
	 * @return bool
	 */
	private function is_active_icon_exist( $item ) {
		return array_key_exists( 'tab_icon_active', $item ) && ! empty( $item['tab_icon_active'] ) && ! empty( $item['tab_icon_active']['value'] );
	}
}
