<?php

namespace Elementor;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor Hotspot widget.
 *
 * Elementor widget that displays a...
 *
 * @since ?
 */
class Widget_Hotspot extends Widget_Base
{

	/**
	 * Get widget name.
	 *
	 * Retrieve accordion widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name()
	{
		return 'hotspot';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve accordion widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title()
	{
		return __('Hotspot', 'elementor');
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve hotspot widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon()
	{
		return 'eicon-image-hotspot';
	}

	public function get_categories()
	{
		return ['basic'];
	}

	public function get_keywords()
	{
		return ['hotspot'];
	}

	protected function register_controls()
	{
		/**
		 * Background Section
		 */
		$this->start_controls_section(
			'background_section',
			[
				'label' => __('Background', 'elementor'),
			]
		);

		$this->add_control(
			'background_image',
			[
				'label' => __('Image', 'elementor'),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name' => 'thumbnail',
				'default' => 'large',
				'separator' => 'none',
			]
		);

		$this->add_responsive_control(
			'background_align',
			[
				'label' => __('Alignment', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __('Left', 'elementor'),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __('Center', 'elementor'),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => __('Right', 'elementor'),
						'icon' => 'eicon-text-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		/**
		 * Section Hotspot
		 */
		$this->start_controls_section(
			'hotspot_section',
			[
				'label' => __('Hotspot', 'elementor'),
			]
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs('hotspot_repeater');

		$repeater->start_controls_tab(
			'hotspot_background_tab',
			[
				'label' => __('Background', 'elementor')
			]
		);

		$repeater->add_control(
			'hotspot_label',
			[
				'label' => __('Label', 'elementor'),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'label_block' => true
			]
		);

		$repeater->add_control(
			'hotspot_icon',
			[
				'label' => __('Icon', 'elementor'),
				'type' => Controls_Manager::ICONS,
				'skin' => 'inline',
				'label_block' => false,
			]
		);

		$repeater->add_control(
			'hotspot_icon_position',
			[
				'label' => __('Icon Position', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => __('Icon Start', 'elementor'),
						'icon' => 'eicon-h-align-left'
					],
					'end' => [
						'title' => __('Icon End', 'elementor'),
						'icon' => 'eicon-h-align-right'
					]
				],
				'selectors_dictionary' => [
					'start' => 'grid-column: 1;',
					'end' => 'grid-column: 2;',
				],
				'condition' => [
					'hotspot_icon[value]!' => '',
					'hotspot_label[value]!' => ''
				],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot-icon' => '{{VALUE}}',
				],
				'default' => 'start',
			]
		);

		$repeater->add_control(
			'hotspot_icon_spacing',
			[
				'label' => __('Icon Spacing', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'size' => '5',
					'unit' => 'px',
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}} .e-hotspot__button' => 'grid-gap: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'hotspot_icon[value]!' => '',
					'hotspot_label[value]!' => ''
				],
			]
		);

		$repeater->add_control(
			'hotspot_tooltip_content',
			[
				'render_type' => 'template',
				'label' => __('Tooltip Content', 'elementor'),
				'type' => Controls_Manager::WYSIWYG,
			]
		);



		$repeater->end_controls_tab();

		$repeater->start_controls_tab(
			'hotspot_position_tab',
			[
				'label' => __('POSITION', 'elementor')
			]
		);

		$repeater->add_control(
			'hotspot_horizontal',
			[
				'label' => __('Horizontal Orientation', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'default' => is_rtl() ? 'right' : 'left',
				'options' => [
					'left' => [
						'title' => __('Left', 'elementor'),
						'icon' => 'eicon-h-align-left',
					],
					'right' => [
						'title' => __('Right', 'elementor'),
						'icon' => 'eicon-h-align-right',
					]
				],
				'render_type' => 'ui',
			]
		);

		$repeater->add_responsive_control(
			'hotspot_offset_x',
			[
				'label' => __('Offset', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -2000,
						'max' => 2000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					]
				],
				'size_units' => ['px', '%'],
				'default' => [
					'size' => '50',
					'unit' => '%'
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '{{hotspot_horizontal.VALUE}}: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$repeater->add_control(
			'hotspot_vertical',
			[
				'label' => __('Vertical Orientation', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'top' => [
						'title' => __('Top', 'elementor'),
						'icon' => 'eicon-v-align-top',
					],
					'bottom' => [
						'title' => __('Bottom', 'elementor'),
						'icon' => 'eicon-v-align-bottom',
					]
				],
				'default' => 'top',
				'render_type' => 'ui',
			]
		);

		$repeater->add_responsive_control(
			'hotspot_offset_y',
			[
				'label' => __('Offset', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -2000,
						'max' => 2000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					]
				],
				'size_units' => ['px', '%'],
				'default' => [
					'size' => '50',
					'unit' => '%'
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '{{hotspot_vertical.VALUE}}: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$repeater->add_control(
			'hotspot_tooltip_position',
			[
				'label' => __('Custom Tooltip Position', 'elementor'),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __('Off', 'elementor'),
				'label_on' => __('On', 'elementor'),
				'default' => 'no',
				'description' => sprintf(__('Set custom Tooltip opening that will only affect this specific hotspot.', 'elementor'), '<code>|</code>'),
				//'render_type' => 'ui',
			]
		);

		$repeater->add_control(
			'hotspot_heading',
			[
				'label' => __('Box', 'elementor'),
				'type' => Controls_Manager::HEADING,
				'condition' => [
					'hotspot_tooltip_position' => 'yes',
				],
			]
		);

		$repeater->add_responsive_control(
			'hotspot_position',
			[
				'label' => __('Position', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'right' => [
						'title' => __('Left', 'elementor'),
						'icon' => 'eicon-h-align-left',
					],
					'bottom' => [
						'title' => __('Top', 'elementor'),
						'icon' => 'eicon-v-align-top',
					],
					'left' => [
						'title' => __('Right', 'elementor'),
						'icon' => 'eicon-h-align-right',
					],
					'top' => [
						'title' => __('Bottom', 'elementor'),
						'icon' => 'eicon-v-align-bottom',
					]
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}} .e-tooltip-position' => 'right: initial;bottom: initial;left: initial;top: initial;{{VALUE}}: calc(100% + 5px );'
				],
				'condition' => [
					'hotspot_tooltip_position' => 'yes',
				],
				'render_type' => 'template',
			]
		);

		$repeater->add_responsive_control(
			'hotspot_width',
			[
				'label' => __('Width', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 2000,
						'step' => 1,
					],
					'%' => [
						'min' => 0,
						'max' => 200,
						'step' => 1,
					]
				],
				'size_units' => ['px', '%'],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}} .e-hotspot__tooltip' => 'width: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'hotspot_tooltip_position' => 'yes',
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'hotspot',
			[
				'label' => __('Hotspot', 'elementor'),
				'title_field' => 'Hotspot',
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'title_field' => '{{{ hotspot_label }}}',
				'default' => [
					[
						// Default #1 circle
					]
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'hotspot_animation',
			[
				'label' => __('Animation', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'e-hotspot--soft-beat' => __('Soft Beat', 'elementor'),
					'e-hotspot--expand' => __('Expand', 'elementor'),
					'e-hotspot--overlay' => __('Overlay', 'elementor'),
					'' => __('None', 'elementor'),
				],
				'default' => '',
			]
		);

		$this->add_control(
			'e-hotspot_sequenced_animation',
			[
				'label' => __('Sequenced Animation', 'elementor'),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __('Off', 'elementor'),
				'label_on' => __('On', 'elementor'),
				'default' => 'yes',
				'frontend_available' => true
			]
		);

		$this->end_controls_section();

		/**
		 * Tooltip Section
		 */
		$this->start_controls_section(
			'tooltip_section',
			[
				'label' => __('Tooltip', 'elementor'),
			]
		);

		$this->add_responsive_control(
			'tooltip_position',
			[
				'label' => __('Position', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'top',
				'toggle' => false,
				'options' => [
					'right' => [
						'title' => __('Left', 'elementor'),
						'icon' => 'eicon-h-align-left',
					],
					'bottom' => [
						'title' => __('Top', 'elementor'),
						'icon' => 'eicon-v-align-top',
					],
					'left' => [
						'title' => __('Right', 'elementor'),
						'icon' => 'eicon-h-align-right',
					],
					'top' => [
						'title' => __('Bottom', 'elementor'),
						'icon' => 'eicon-v-align-bottom',
					]
				],
				'selectors' => [
					'{{WRAPPER}} .e-tooltip-position' => 'right: initial;bottom: initial;left: initial;top: initial;{{VALUE}}: calc(100% + 5px );'
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'tooltip_trigger',
			[
				'label' => __('Trigger', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'mouseenter' => __('Hover', 'elementor'),//
					'click' => __('Click', 'elementor'),
					'none' => __('None', 'elementor'),
				],
				'default' => 'click',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'tooltip_animation',
			[
				'label' => __('Animation', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'e-hotspot--fade-in-out' => __('Fade In/Out', 'elementor'),
					//'e-hotspot--fade-grow' => __('Fade Grow', 'elementor'),
					'e-hotspot--fade-direction' => __('Fade By Direction', 'elementor'),
					'e-hotspot--slide-direction' => __('Slide By Direction', 'elementor'),
				],
				'default' => 'e-hotspot--fade-in-out',
				'placeholder' => __('Enter your image caption', 'elementor'),
				'condition' => [
					'tooltip_trigger!' => 'none',
				],
				'frontend_available' => true,
				// 'prefix_class' => '',
				// 'render_type' => 'template',
			]
		);

		$this->add_control(
			'tooltip_animation_duration',
			[
				'label' => __('Duration', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 10000,
					],
				],
				'default' => ['size' => 500],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'transition-duration: {{SIZE}}ms;'
				],
				'condition' => [
					'tooltip_trigger!' => 'none',
				],
			]
		);


		$this->end_controls_section();


		/*************
		 * Style Tab
		 ************/
		/**
		 * Section Style Background
		 */
		$this->start_controls_section(
			'section_style_background',
			[
				'label' => __('Background', 'elementor'),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'background_width',
			[
				'label' => __('Width', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 100,
					],
					'px' => [
						'min' => 0,
						'max' => 2000,
						'step' => 1,
					],
					'vw' => [
						'min' => 0,
						'max' => 200,
						'step' => 1,
					]
				],
				'size_units' => ['px', '%', 'vw'],
				'selectors' => [
					'{{WRAPPER}} .e-widget-container>img' => 'width: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$this->add_responsive_control(
			'background_height',
			[
				'label' => __('Height', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 100,
					],
					'px' => [
						'min' => 0,
						'max' => 2000,
						'step' => 1,
					],
					'vw' => [
						'min' => 0,
						'max' => 200,
						'step' => 1,
					]
				],
				'size_units' => ['px', '%', 'vw'],
				'selectors' => [
					'{{WRAPPER}} .e-widget-container>img' => 'height: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$this->add_control(
			'background_opacity',
			[
				'label' => __('Opacity', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-widget-container>img' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->end_controls_section();

		/**
		 * Section Style Hotspot
		 */
		$this->start_controls_section(
			'section_style_hotspot',
			[
				'label' => __('Hotspot', 'elementor'),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_hotspot_color',
			[
				'label' => __('Color', 'elementor'),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__inner-circle' => 'background-color: {{VALUE}};',
					'{{WRAPPER}} .e-hotspot__button' => 'color: {{VALUE}};',
				],
				'global' => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
			]
		);

		$this->add_responsive_control(
			'style_hotspot_size',
			[
				'label' => __('Size', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 100,
					],
					'px' => [
						'min' => 0,
						'max' => 300,
						'step' => 1,
					]
				],
				'size_units' => ['px', '%'],
				'default' => [
					'size' => '12',
					'unit' => 'px'
				],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot--circle .e-hotspot__button .e-hotspot__inner-circle' => 'padding: calc({{SIZE}}{{UNIT}} / 2);',
					'{{WRAPPER}} .e-hotspot .e-hotspot__button' => 'font-size: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .e-hotspot--icon .e-hotspot__button' => 'font-size: {{SIZE}}{{UNIT}};width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};',
				]
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_typography',
				'selector' => '{{WRAPPER}} .e-hotspot-label',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
			]
		);

		$this->add_responsive_control(
			'style_hotspot_width',
			[
				'label' => __('Width', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'%' => [
						'min' => 0,
						'max' => 200,
					],
					'px' => [
						'min' => 0,
						'max' => 1000,
						'step' => 1,
					]
				],
				'size_units' => ['px', '%'],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button' => 'width: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$this->add_control(
			'style_hotspot_box_color',
			[
				'label' => __('Box Color', 'elementor'),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button,
					{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button.e-hotspot--expand::before,
					{{WRAPPER}} .e-hotspot__outer-circle' => 'background-color: {{VALUE}};',
				],
				'global' => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
			]
		);

		$this->add_responsive_control(
			'style_hotspot_padding',
			[
				'label' => __('Padding', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'px' => [
						'min' => 0,
						'max' => 100,
						'step' => 1,
					]
				],
				'size_units' => ['px', 'em'],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button' => 'padding: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .e-hotspot.e-hotspot--circle .e-hotspot__button .e-hotspot__outer-circle' => 'padding: {{SIZE}}{{UNIT}};width:{{style_hotspot_size.SIZE}}{{style_hotspot_size.UNIT}};height:{{style_hotspot_size.SIZE}}{{style_hotspot_size.UNIT}};',
				],
				'default' => [
					'size' => '10',
					'unit' => 'px'
				]
			]
		);

		$this->add_control(
			'style_hotspot_border_radius',
			[
				'label' => __('Border Radius', 'elementor'),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => ['px', 'em', '%'],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					'{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button::before' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'default' => [
					'top' => '3',
					'bottom' => '3',
					'left' => '3',
					'right' => '3',
					'unit' => 'px',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'style_hotspot_box_shadow',
				'selector' => '
					{{WRAPPER}} .e-hotspot:not(.e-hotspot--circle) .e-hotspot__button,
					{{WRAPPER}} .e-hotspot.e-hotspot--circle .e-hotspot__button .e-hotspot__outer-circle
				',
			]
		);

		$this->end_controls_section();

		/**
		 * Section Style Tooltip
		 */
		$this->start_controls_section(
			'section_style_tooltip',
			[
				'label' => __('Tooltip', 'elementor'),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'style_tooltip_text_color',
			[
				'label' => __('Text Color', 'elementor'),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'color: {{VALUE}};',
				],
				'global' => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'style_tooltip_typography',
				'selector' => '{{WRAPPER}} .e-hotspot__tooltip',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
			]
		);

		$this->add_responsive_control(
			'style_tooltip_align',
			[
				'label' => __('Alignment', 'elementor'),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left'    => [
						'title' => __('Left', 'elementor'),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __('Center', 'elementor'),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => __('Right', 'elementor'),
						'icon' => 'eicon-text-align-right',
					],
					'justify' => [
						'title' => __('Justified', 'elementor'),
						'icon' => 'eicon-text-align-justify',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'style_tooltip_heading',
			[
				'label' => __('Box', 'elementor'),
				'type' => Controls_Manager::HEADING,
			]
		);

		$this->add_responsive_control(
			'style_tooltip_width',
			[
				'label' => __('Width', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 2000,
						'step' => 1,
					],
					'%' => [
						'min' => 0,
						'max' => 200,
					]
				],
				'default' => [
					'size' => '200',
					'unit' => 'px'
				],
				'size_units' => ['px', '%'],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'width: {{SIZE}}{{UNIT}}',
				]
			]
		);

		$this->add_responsive_control(
			'style_tooltip_padding',
			[
				'label' => __('Padding', 'elementor'),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => ['px', 'em', '%'],
				'default' => [
					'left' => '8',
					'top' => '12',
					'right' => '8',
					'bottom' => '12',
					'unit' => 'px'
				],
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'style_tooltip_color',
			[
				'label' => __('Color', 'elementor'),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-hotspot__tooltip' => 'background-color: {{VALUE}};',
				],
				'global' => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'style_tooltip_box_shadow',
				'selector' => '{{WRAPPER}} .e-hotspot__tooltip',
			]
		);

		$this->end_controls_section();
	}


	protected function render()
	{
		$settings = $this->get_settings_for_display();

		$is_tooltip_direction_animation = ($settings['tooltip_animation'] === 'e-hotspot--slide-direction' || $settings['tooltip_animation'] === 'e-hotspot--fade-direction') ? true : false;
		$show_tooltip = ($settings['tooltip_trigger'] === 'none');

?>
		<!-- Main Image -->
		<?= Group_Control_Image_Size::get_attachment_image_html($settings, 'thumbnail', 'background_image'); ?>

		<!-- Hotspot -->
		<?php foreach ($settings['hotspot'] as $key => $hotspot) :
			$is_circle = !$hotspot['hotspot_label'] && !$hotspot['hotspot_icon']['value'];
			$is_only_icon = !$hotspot['hotspot_label'] && $hotspot['hotspot_icon']['value'];

			// hotspot attributes
			$hotspot_repeater_setting_key = $this->get_repeater_setting_key('hotspot', 'hotspots', $key);
			$this->add_render_attribute($hotspot_repeater_setting_key, [
				'class' => [
					'e-hotspot',
					'elementor-repeater-item-' . $hotspot['_id']
				]
			]);
			if ($is_circle) {
				$this->add_render_attribute($hotspot_repeater_setting_key, 'class', 'e-hotspot--circle');
			}
			if ($is_only_icon) {
				$this->add_render_attribute($hotspot_repeater_setting_key, 'class', 'e-hotspot--icon');
			}

			// hotspot trigger attributes
			$trigger_repeater_setting_key = $this->get_repeater_setting_key('trigger', 'hotspots', $key);
			$this->add_render_attribute($trigger_repeater_setting_key, [
				'class' => [
					'e-hotspot__button',
					$settings['hotspot_animation'],
				]
			]);

			//direction mask attributes
			$direction_mask_repeater_setting_key = $this->get_repeater_setting_key('e-hotspot__direction-mask', 'hotspots', $key);
			$this->add_render_attribute($direction_mask_repeater_setting_key, [
				'class' => [
					'e-hotspot__direction-mask',
					( $is_tooltip_direction_animation ) ? 'e-tooltip-position' : ''
				]
			]);

			//tooltip attributes
			$tooltip_custom_position = ( $hotspot['hotspot_tooltip_position'] && $hotspot['hotspot_position'] ) ? 'e-hotspot--overide-animation-slide-from-' . $hotspot['hotspot_position'] : '';
			$tooltip_repeater_setting_key = $this->get_repeater_setting_key('tooltip', 'hotspots', $key);
			$this->add_render_attribute( $tooltip_repeater_setting_key, [
				'class' => [
					'e-hotspot__tooltip',
					( $show_tooltip ) ? 'e-hotspot--show-tooltip' : '',
					( !$is_tooltip_direction_animation ) ? 'e-tooltip-position' : '',
					( !$show_tooltip ) ? $settings['tooltip_animation'] : '' ,
					$tooltip_custom_position
				]
			] );

		?>

			<div <?= $this->get_render_attribute_string($hotspot_repeater_setting_key) ?>>

				<!-- Hotspot Trigger -->
				<div <?= $this->get_render_attribute_string($trigger_repeater_setting_key) ?>>
					<?php if ($is_circle) : ?>
						<div class="e-hotspot__outer-circle"></div>
						<div class="e-hotspot__inner-circle"></div>
					<?php else : ?>
						<?php if ($hotspot['hotspot_icon']['value']) : ?>
							<div class="e-hotspot-icon"><?php Icons_Manager::render_icon($hotspot['hotspot_icon']); ?></div>
						<?php endif; ?>
						<?php if ($hotspot['hotspot_label']) : ?>
							<div class="e-hotspot-label"><?= $hotspot['hotspot_label'] ?></div>
						<?php endif; ?>
					<?php endif; ?>
				</div>

				<!-- Hotspot Tooltip -->
				<?php if ($is_tooltip_direction_animation) : ?>
					<div <?= $this->get_render_attribute_string($direction_mask_repeater_setting_key) ?>>
					<?php endif; ?>
					<div <?= $this->get_render_attribute_string( $tooltip_repeater_setting_key ) ?> >
						<?= $hotspot['hotspot_tooltip_content'] ?>
					</div>
					<?php if ($is_tooltip_direction_animation) : ?>
					</div>
				<?php endif; ?>
			</div>

		<?php endforeach; ?>
						
	<?php
	}

	/**
	 * Render Hotspot widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template()
	{
	?>
		<#

		const image = {
			id: settings.background_image.id,
			url: settings.background_image.url,
			size: settings.thumbnail_size,
			dimension: settings.thumbnail_custom_dimension,
			model: view.getEditModel()
		};

		const image_url = elementor.imagesManager.getImageUrl( image );

		#>
			<img src="{{ image_url }}" title="" alt="">
		<#
		const is_tooltip_direction_animation = (settings.tooltip_animation==='e-hotspot--slide-direction' || settings.tooltip_animation==='e-hotspot--fade-direction' ) ? true : false;
		const show_tooltip = ( settings.tooltip_trigger === 'none' );

			_.each( settings.hotspot, ( hotspot, index ) => {
				const iconHTML = elementor.helpers.renderIcon( view, hotspot.hotspot_icon, {}, 'i' , 'object' );

				const is_circle = !hotspot.hotspot_label && !hotspot.hotspot_icon.value;
				const is_only_icon = !hotspot.hotspot_label && hotspot.hotspot_icon.value;

				// hotspot attributes
				const hotspot_repeater_setting_key = view.getRepeaterSettingKey('hotspot', 'hotspots', index);
				view.addRenderAttribute(hotspot_repeater_setting_key, {
					'class' : [
						'e-hotspot',
						'elementor-repeater-item-' + hotspot._id,
					]
				});
				if (is_circle) {
					view.addRenderAttribute(hotspot_repeater_setting_key, 'class', 'e-hotspot--circle');
				}
				if (is_only_icon) {
					view.addRenderAttribute(hotspot_repeater_setting_key, 'class', 'e-hotspot--icon');
				}

				// hotspot trigger attributes
				const trigger_repeater_setting_key = view.getRepeaterSettingKey('trigger', 'hotspots', index);
				view.addRenderAttribute(trigger_repeater_setting_key, {
					'class' : [
						'e-hotspot__button',
						settings.hotspot_animation,
						//'hotspot-trigger-' + hotspot.hotspot_icon_position
					]
				});

				//direction mask attributes
				const direction_mask_repeater_setting_key = view.getRepeaterSettingKey('e-hotspot__direction-mask', 'hotspots', index);
				view.addRenderAttribute(direction_mask_repeater_setting_key, {
					'class' : [
						'e-hotspot__direction-mask',
						( is_tooltip_direction_animation ) ? 'e-tooltip-position' : ''
					]
				});

				//tooltip attributes
				const tooltip_custom_position = ( hotspot.hotspot_tooltip_position && hotspot.hotspot_position ) ? 'e-hotspot--overide-animation-slide-from-' + hotspot.hotspot_position : '';
				const tooltip_repeater_setting_key = view.getRepeaterSettingKey('tooltip', 'hotspots', index);
				view.addRenderAttribute( tooltip_repeater_setting_key, {
					'class': [
						'e-hotspot__tooltip',
						( show_tooltip ) ? 'e-hotspot--show-tooltip' : '',
						( !is_tooltip_direction_animation ) ? 'e-tooltip-position' : '',
						( !show_tooltip ) ? settings.tooltip_animation : '',
						tooltip_custom_position
					],
				});

			#>
				<div {{{ view.getRenderAttributeString( hotspot_repeater_setting_key ) }}} >

					<!-- Hotspot Trigger -->
					<div {{{ view.getRenderAttributeString( trigger_repeater_setting_key ) }}} >
						<# if (is_circle) { #>
							<div class="e-hotspot__outer-circle"></div>
							<div class="e-hotspot__inner-circle"></div>
							<# } else { #>
								<# if (hotspot.hotspot_icon.value){ #>
									<div class="e-hotspot-icon">{{{ iconHTML.value }}}</div>
									<# } #>
										<# if (hotspot.hotspot_label){ #>
											<div class="e-hotspot-label">{{{ hotspot.hotspot_label }}}</div>
											<# } #>
												<# } #>
					</div>

					<!-- Hotspot Tooltip -->
					<# if(is_tooltip_direction_animation){ #>
						<div {{{ view.getRenderAttributeString( direction_mask_repeater_setting_key ) }}} >
							<# } #>
								<div {{{ view.getRenderAttributeString( tooltip_repeater_setting_key ) }}} >
									{{{hotspot.hotspot_tooltip_content}}}
								</div>
								<# if(is_tooltip_direction_animation){ #>
						</div>
						<# } #>
				</div>
				<# }); #>
			<?php
		}
	}
