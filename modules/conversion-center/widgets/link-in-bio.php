<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Modules\ConversionCenter\Classes\Render\Core_Render_Strategy;
use Elementor\Modules\ConversionCenter\Module as ConversionCenterModule;
use Elementor\Plugin;
use Elementor\Widget_Base;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Group_Control_Background;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Nested Accordion widget.
 *
 * Elementor widget that displays a collapsible display of content in an
 * accordion style.
 *
 * @since 3.15.0
 */
class Link_In_Bio extends Widget_Base {

	public function get_name() {
		return 'link-in-bio';
	}

	public function get_title() {
		return esc_html__( 'Link In Bio', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-bullet-list';
	}

	public function get_categories() {
		return [ 'general' ];
	}

	public function get_keywords() {
		return [ 'buttons', 'bio', 'widget' ];
	}

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( ConversionCenterModule::EXPERIMENT_NAME );
	}

	protected function register_controls() {
		$this->start_controls_section(
			'bio_section',
			[
				'label' => esc_html__( 'Bio', 'elementor-list-widget' ),
				'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);
		$this->add_control(
			'heading',
			[
				'label'       => esc_html__( 'Heading', 'elementor-oembed-widget' ),
				'type'        => \Elementor\Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'placeholder' => esc_html__( 'Heading', 'elementor-oembed-widget' ),
			]
		);

		$this->end_controls_section();

		$this->add_style_tab();
	}

	private function add_style_tab() {

		$this->start_controls_section(
			'identity_section_style',
			[
				'label' => esc_html__( 'Identity', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'identity_image_size',
			[
				'label' => esc_html__( 'Image Size', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
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
					'unit' => '%',
					'size' => 50,
				],
				// TODO: uncomment and adjust attributes if necessary when content controls are available
				// 'condition' => [
				// 	'image_style' => 'profile',
				// ],
				// TODO: add class selector when markup is done
				// 'selectors' => [
					// '{{WRAPPER}} .your-class' => 'width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_shape',
			[
				'label' => esc_html__( 'Image Shape', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'circle',
				'options' => [
					'circle' => esc_html__( 'Circle', 'elementor' ),
					'square'  => esc_html__( 'Square', 'elementor' ),
				],
				// TODO: uncomment and adjust attributes if necessary when content controls are available
				// 'condition' => [
				// 	'image_style' => 'profile',
				// ],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_show_border',
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'no',
			]
			// TODO: uncomment and adjust attributes if necessary when content controls are available
			// 'condition' => [
			// 	'image_style' => 'profile',
			// ],
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'identity_image_border_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 10,
						'step' => 1,
					],
				],
				'condition' => [
					'identity_image_show_border' => 'yes',
				],
				// TODO: uncomment and adjust attributes if necessary when content controls are available
				// 'condition' => [
				// 	'image_style' => 'profile',
				// ],
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'condition' => [
					'identity_image_show_border' => 'yes',
				],
				// TODO: uncomment and adjust attributes if necessary when content controls are available
				// 'condition' => [
				// 	'image_style' => 'profile',
				// ],
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-bottom-color: {{VALUE}};',
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-color: {{VALUE}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_height',
			[
				'label' => esc_html__( 'Image Height', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
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
					'unit' => '%',
					'size' => 50,
				],
				// TODO: uncomment and adjust attributes if necessary when content controls are available
				// 'condition' => [
				// 	'image_style' => 'cover',
				// ],
				// TODO: add class selector when markup is done
				// 'selectors' => [
					// '{{WRAPPER}} .your-class' => 'width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_show_bottom_border',
			[
				'label' => esc_html__( 'Bottom Border', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'no',
			]
			// TODO: uncomment and adjust attributes if necessary when content controls are available
			// 'condition' => [
			// 	'image_style' => 'cover',
			// ],
			// TODO: add class selector when markup is done
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'identity_image_border_bottom_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 10,
						'step' => 1,
					],
				],
				'condition' => [
					// TODO: uncomment and adjust attributes if necessary when content controls are available
					// 	'image_style' => 'cover',
					'identity_image_show_bottom_border' => 'yes',

				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'identity_image_bottom_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'condition' => [
					// TODO: uncomment and adjust attributes if necessary when content controls are available
					// 	'image_style' => 'cover',
					'identity_image_show_bottom_border' => 'yes',
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-bottom-color: {{VALUE}};',
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-color: {{VALUE}};',
				// ],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'bio_section_style',
			[
				'label' => esc_html__( 'Bio', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'bio_heading_heading',
			[
				'label' => esc_html__( 'Heading', 'elementor' ),
				'type' => \Elementor\Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_heading_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'color: {{VALUE}}',
				// ],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'bio_heading_typography',
				// TODO: add class selector when markup is done
				// 'selector' => '{{WRAPPER}} .your-class',
			]
		);

		$this->add_control(
			'bio_title_heading',
			[
				'label' => esc_html__( 'Title or Tagline', 'elementor' ),
				'type' => \Elementor\Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_title_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'color: {{VALUE}}',
				// ],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'bio_title_typography',
				// TODO: add class selector when markup is done
				// 'selector' => '{{WRAPPER}} .your-class',
			]
		);

		$this->add_control(
			'bio_description_heading',
			[
				'label' => esc_html__( 'Description', 'elementor' ),
				'type' => \Elementor\Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'bio_description_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'color: {{VALUE}}',
				// ],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'bio_description_typography',
				// TODO: add class selector when markup is done
				// 'selector' => '{{WRAPPER}} .your-class',
			]
		);

		$this->end_controls_section();


		$this->start_controls_section(
			'icons_section_style',
			[
				'label' => esc_html__( 'Icons', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'icons_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'color: {{VALUE}}',
				// ],
			]
		);

		$this->add_control(
			'icons_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'small',
				'options' => [
					'small' => esc_html__( 'Small', 'elementor' ),
					'medium' => esc_html__( 'Medium', 'elementor' ),
					'large' => esc_html__( 'Large', 'elementor' ),
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
				// ],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'cta_links_section_style',
			[
				'label' => esc_html__( 'CTA Links', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'cta_links_type',
			[
				'label' => esc_html__( 'Type', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'button',
				'options' => [
					'button' => esc_html__( 'Button', 'elementor' ),
					'link' => esc_html__( 'Link', 'elementor' ),
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
				// ],
			]
		);

		$this->add_control(
			'cta_links_text_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'color: {{VALUE}}',
				// ],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Typography::get_type(),
			[
				'name' => 'cta_links_typography',
				// TODO: add class selector when markup is done
				// 'selector' => '{{WRAPPER}} .your-class',
			]
		);

		$this->add_control(
			'cta_links_show_border',
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'no',
			]
			// TODO: add class selector when markup is done
			// 'selectors' => [
			// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
			// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
			// ],
		);

		$this->add_control(
			'cta_links_border_width',
			[
				'label' => esc_html__( 'Border Width', 'elementor' ) . ' (px)',
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 10,
						'step' => 1,
					],
				],
				'condition' => [
					'cta_links_show_border' => 'yes',

				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-width: {{SIZE}}{{UNIT}};',
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-width: {{SIZE}}{{UNIT}};',
				// ],
			]
		);

		$this->add_control(
			'cta_links_border_color',
			[
				'label' => esc_html__( 'Border Color', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'condition' => [
					'cta_links_show_border' => 'yes',
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .elementor-tab-content' => 'border-bottom-color: {{VALUE}};',
				// 	'{{WRAPPER}} .elementor-tab-title' => 'border-color: {{VALUE}};',
				// ],
			]
		);

	
		$this->add_control(
			'cta_links_corners',
			[
				'label' => esc_html__( 'Corners', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'round',
				'options' => [
					'round' => esc_html__( 'Round', 'elementor' ),
					'rounded' => esc_html__( 'Rounded', 'elementor' ),
					'sharp' => esc_html__( 'Sharp', 'elementor' ),
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
				// ],
			]
		);

		$this->add_control(
			'hr',
			[
				'type' => \Elementor\Controls_Manager::DIVIDER,
			]
		);

		$this->add_control(
			'cta_links_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem' ],
				'default' => [
					'top' => 2,
					'right' => 0,
					'bottom' => 0,
					'left' => 0,
					'unit' => 'px',
					'isLinked' => false,
				],
				// TODO: add class selector when markup is done
				// 'selectors' => [
				// 	'{{WRAPPER}} .your-class' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				// ],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'background_border_section_style',
			[
				'label' => esc_html__( 'Background and Border', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);


		$this->add_control(
			'background_border_background',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'type' => \Elementor\Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_border_background_group',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				// 'selector' => '{{WRAPPER}} .elementor-button',
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
				'label' => esc_html__( 'Background Overlay', 'elementor' ),
				'type' => \Elementor\Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_border_background_overlay_group',
				'types' => [ 'classic', 'gradient' ],
				'exclude' => [ 'image' ],
				// 'selector' => '{{WRAPPER}} .elementor-button',
				'fields_options' => [
					'background' => [
						'default' => 'classic',
					],
				],
			]
		);

		$this->end_controls_section();

	}


	protected function render() {
		$render_strategy = new Core_Render_Strategy();

		$render_strategy->render( $this );
	}
}
