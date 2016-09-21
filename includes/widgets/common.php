<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Common extends Widget_Base {

	public function get_name() {
		return 'common';
	}

	protected function _register_controls() {
		$this->add_control(
			'_section_style',
			[
				'label' => __( 'Element Style', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_responsive_control(
			'_margin',
			[
				'label' => __( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'_animation',
			[
				'label' => __( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => '',
				'prefix_class' => 'animated ',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'label_block' => true,
				'section' => '_section_style',
			]
		);

		$this->add_control(
			'animation_duration',
			[
				'label' => __( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => __( 'Slow', 'elementor' ),
					'' => __( 'Normal', 'elementor' ),
					'fast' => __( 'Fast', 'elementor' ),
				],
				'prefix_class' => 'animated-',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'condition' => [
					'_animation!' => '',
				],
			]
		);

		$this->add_control(
			'_css_classes',
			[
				'label' => __( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'default' => '',
				'prefix_class' => '',
				'label_block' => true,
				'title' => __( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
			]
		);

		$this->add_control(
			'_section_background',
			[
				'label' => __( 'Background & Border', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => '_background',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => '_border',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_control(
			'_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => '_box_shadow',
				'section' => '_section_background',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_control(
			'_section_responsive',
			[
				'label' => __( 'Responsive', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'responsive_description',
			[
				'raw' => __( 'Attention: The display settings (show/hide for mobile, tablet or desktop) will only take effect once you are on the preview or live page, and not while you\'re in editing mode in Elementor.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'classes' => 'elementor-control-descriptor',
			]
		);

		$this->add_control(
			'hide_desktop',
			[
				'label' => __( 'Hide On Desktop', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'label_on' => 'Hide',
				'label_off' => 'Show',
				'return_value' => 'hidden-desktop',
			]
		);

		$this->add_control(
			'hide_tablet',
			[
				'label' => __( 'Hide On Tablet', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'label_on' => 'Hide',
				'label_off' => 'Show',
				'return_value' => 'hidden-tablet',
			]
		);

		$this->add_control(
			'hide_mobile',
			[
				'label' => __( 'Hide On Mobile', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'label_on' => 'Hide',
				'label_off' => 'Show',
				'return_value' => 'hidden-phone',
			]
		);
	}
}
