<?php

namespace Elementor\Modules\Shapes\Widgets;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Typography;
use Elementor\Modules\Shapes\Module as Shapes_Module;
use Elementor\Group_Control_Text_Stroke;
use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor WordArt widget.
 *
 * Elementor widget that displays text along SVG path.
 *
 */
class TextPath extends Widget_Base {

	const DEFAULT_PATH_FILL = '#E8178A';

	/**
	 * Get widget name.
	 *
	 * Retrieve Text Path widget name.
	 *
	 * @return string Widget name.
	 * @access public
	 *
	 */
	public function get_name() {
		return 'text-path';
	}

	public function get_group_name() {
		return 'shapes';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve Text Path widget title.
	 *
	 * @return string Widget title.
	 * @access public
	 *
	 */
	public function get_title() {
		return esc_html__( 'Text Path', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve Text Path widget icon.
	 *
	 * @return string Widget icon.
	 * @access public
	 *
	 */
	public function get_icon() {
		return 'eicon-wordart';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @return array Widget keywords.
	 * @access public
	 *
	 */
	public function get_keywords() {
		return array( 'text path', 'word path', 'text on path', 'wordart', 'word art' );
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the widget requires.
	 *
	 * @since 3.24.0
	 * @access public
	 *
	 * @return array Widget style dependencies.
	 */
	public function get_style_depends(): array {
		return array( 'widget-text-path' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register content controls under content tab.
	 */
	protected function register_content_tab() {
		$this->start_controls_section(
			'section_content_text_path',
			array(
				'label' => esc_html__( 'Text Path', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'text',
			array(
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'default' => esc_html__( 'Add Your Curvy Text Here', 'elementor' ),
				'frontend_available' => true,
				'render_type' => 'none',
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_control(
			'path',
			array(
				'label' => esc_html__( 'Path Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => Shapes_Module::get_paths(),
				'default' => 'wave',
			)
		);

		$this->add_control(
			'custom_path',
			array(
				'label' => esc_html__( 'SVG', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'media_types' => array(
					'svg',
				),
				'condition' => array(
					'path' => 'custom',
				),
				'dynamic' => array(
					'active' => true,
				),
				'description' => sprintf(
					'%1$s <a target="_blank" href="https://go.elementor.com/text-path-create-paths/">%2$s</a>',
					esc_html__( 'Want to create custom text paths with SVG?', 'elementor' ),
					esc_html__( 'Learn more', 'elementor' )
				),
			)
		);

		$this->add_control(
			'link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'label_block' => true,
				'dynamic' => array(
					'active' => true,
				),
				'placeholder' => esc_html__( 'Paste URL or type', 'elementor' ),
				'frontend_available' => true,
			)
		);

		$this->add_responsive_control(
			'align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => '',
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--alignment: {{VALUE}}',
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'text_path_direction',
			array(
				'label' => esc_html__( 'Text Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'rtl' => esc_html__( 'RTL', 'elementor' ),
					'ltr' => esc_html__( 'LTR', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--direction: {{VALUE}}',
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'show_path',
			array(
				'label' => esc_html__( 'Show Path', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'On', 'elementor' ),
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'return_value' => self::DEFAULT_PATH_FILL,
				'separator' => 'before',
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--path-stroke: {{VALUE}}; --path-fill: transparent;',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Register style controls under style tab.
	 */
	protected function register_style_tab() {
		/**
		 * Text Path styling section.
		 */
		$this->start_controls_section(
			'section_style_text_path',
			array(
				'label' => esc_html__( 'Text Path', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'%' => array(
						'min' => 0,
						'max' => 100,
						'step' => 10,
					),
					'px' => array(
						'max' => 800,
						'step' => 50,
					),
				),
				'default' => array(
					'size' => 500,
				),
				'tablet_default' => array(
					'size' => 500,
				),
				'mobile_default' => array(
					'size' => 500,
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'rotation',
			array(
				'label' => esc_html__( 'Rotate', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'deg', 'grad', 'rad', 'turn', 'custom' ),
				'default' => array(
					'unit' => 'deg',
				),
				'tablet_default' => array(
					'unit' => 'deg',
				),
				'mobile_default' => array(
					'unit' => 'deg',
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--rotate: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'text_heading',
			array(
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'text_typography',
				'selector' => '{{WRAPPER}}',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				),
				'fields_options' => array(
					'font_size' => array(
						'default' => array(
							'size' => '20',
							'unit' => 'px',
						),
						'size_units' => array( 'px' ),
					),
					// Text decoration isn't an inherited property, so it's required to explicitly
					// target the specific `textPath` element.
					'text_decoration' => array(
						'selectors' => array(
							'{{WRAPPER}} textPath' => 'text-decoration: {{VALUE}};',
						),
					),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			array(
				'name' => 'text_stroke',
				'selector' => '{{WRAPPER}} textPath',
			)
		);

		$this->add_responsive_control(
			'word_spacing',
			array(
				'label' => esc_html__( 'Word Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'min' => -20,
						'max' => 20,
					),
					'em' => array(
						'min' => -1,
						'max' => 1,
					),
					'rem' => array(
						'min' => -1,
						'max' => 1,
					),
				),
				'default' => array(
					'size' => '',
				),
				'tablet_default' => array(
					'size' => '',
				),
				'mobile_default' => array(
					'size' => '',
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--word-spacing: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'start_point',
			array(
				'label' => esc_html__( 'Starting Point', 'elementor' ) . ' (%)',
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( '%' ),
				'range' => array(
					'px' => array(
						'min' => -100,
						'max' => 100,
						'step' => 1,
					),
				),
				'default' => array(
					'unit' => '%',
					'size' => 0,
				),
				'frontend_available' => true,
				'render_type' => 'none',
			)
		);

		$this->start_controls_tabs( 'text_style' );

		/**
		 * Normal tab.
		 */
		$this->start_controls_tab(
			'text_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_control(
			'text_color_normal',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--text-color: {{VALUE}};',
				),
			)
		);

		$this->end_controls_tab();

		/**
		 * Hover tab.
		 */
		$this->start_controls_tab(
			'text_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_control(
			'text_color_hover',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--text-color-hover: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'hover_animation',
			array(
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			)
		);

		$this->add_control(
			'hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 's', 'ms', 'custom' ),
				'default' => array(
					'unit' => 's',
					'size' => 0.3,
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--transition: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		/**
		 * Path styling section.
		 */
		$this->start_controls_section(
			'section_style_path',
			array(
				'label' => esc_html__( 'Path', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'show_path!' => '',
				),
			)
		);

		$this->start_controls_tabs( 'path_style' );

		/**
		 * Normal tab.
		 */
		$this->start_controls_tab(
			'path_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_control(
			'path_fill_normal',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--path-fill: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'stroke_heading_normal',
			array(
				'label' => esc_html__( 'Stroke', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_control(
			'stroke_color_normal',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => self::DEFAULT_PATH_FILL,
				'selectors' => array(
					'{{WRAPPER}}' => '--stroke-color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'stroke_width_normal',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 1,
				),
				'range' => array(
					'px' => array(
						'min' => 1,
						'max' => 20,
					),
					'em' => array(
						'max' => 2,
					),
					'rem' => array(
						'max' => 2,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--stroke-width: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_tab();

		/**
		 * Hover tab.
		 */
		$this->start_controls_tab(
			'path_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_control(
			'path_fill_hover',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--path-fill-hover: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'stroke_heading_hover',
			array(
				'label' => esc_html__( 'Stroke', 'elementor' ),
				'type' => Controls_Manager::HEADING,
			)
		);

		$this->add_control(
			'stroke_color_hover',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => '--stroke-color-hover: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'stroke_width_hover',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => '',
				),
				'range' => array(
					'px' => array(
						'min' => 1,
						'max' => 20,
					),
					'em' => array(
						'max' => 2,
					),
					'rem' => array(
						'max' => 2,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--stroke-width-hover: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_control(
			'stroke_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 's', 'ms', 'custom' ),
				'default' => array(
					'unit' => 's',
					'size' => 0.3,
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--stroke-transition: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register Text Path widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @access protected
	 */
	protected function register_controls() {
		$this->register_content_tab();
		$this->register_style_tab();
	}

	/**
	 * Render Text Path widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		// Get the path URL.
		$path_url = ( 'custom' === $settings['path'] )
			? wp_get_attachment_url( $settings['custom_path']['id'] )
			: Shapes_Module::get_path_url( $settings['path'] );

		// Remove the HTTP protocol to prevent Mixed Content error.
		$path_url = preg_replace( '/^https?:/i', '', $path_url );

		// Add Text Path attributes.
		$this->add_render_attribute( 'text_path', array(
			'class' => 'e-text-path',
			'data-text' => htmlentities( esc_attr( $settings['text'] ) ),
			'data-url' => esc_url( $path_url ),
			'data-link-url' => esc_url( $settings['link']['url'] ?? '' ),
		) );

		// Add hover animation.
		if ( ! empty( $settings['hover_animation'] ) ) {
			$this->add_render_attribute( 'text_path', 'class', 'elementor-animation-' . $settings['hover_animation'] );
		}

		// Render.
		?>
		<div <?php $this->print_render_attribute_string( 'text_path' ); ?>></div>
		<?php
	}
}
