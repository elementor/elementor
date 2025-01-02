<?php
namespace Elementor;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor column element.
 *
 * Elementor column handler class is responsible for initializing the column
 * element.
 *
 * @since 1.0.0
 */
class Element_Column extends Element_Base {

	/**
	 * Get column name.
	 *
	 * Retrieve the column name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column name.
	 */
	public function get_name() {
		return 'column';
	}

	/**
	 * Get element type.
	 *
	 * Retrieve the element type, in this case `column`.
	 *
	 * @since 2.1.0
	 * @access public
	 * @static
	 *
	 * @return string The type.
	 */
	public static function get_type() {
		return 'column';
	}

	/**
	 * Get column title.
	 *
	 * Retrieve the column title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column title.
	 */
	public function get_title() {
		return esc_html__( 'Column', 'elementor' );
	}

	/**
	 * Get column icon.
	 *
	 * Retrieve the column icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column icon.
	 */
	public function get_icon() {
		return 'eicon-column';
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Get initial config.
	 *
	 * Retrieve the current section initial configuration.
	 *
	 * Adds more configuration on top of the controls list, the tabs assigned to
	 * the control, element name, type, icon and more. This method also adds
	 * section presets.
	 *
	 * @since 2.9.0
	 * @access protected
	 *
	 * @return array The initial config.
	 */
	protected function get_initial_config() {
		$config = parent::get_initial_config();

		$config['controls'] = $this->get_controls();
		$config['tabs_controls'] = $this->get_tabs_controls();

		return $config;
	}

	/**
	 * Register column controls.
	 *
	 * Used to add new controls to the column element.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		// Section Layout.
		$this->start_controls_section(
			'layout',
			array(
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => Controls_Manager::TAB_LAYOUT,
			)
		);

		// Element Name for the Navigator
		$this->add_control(
			'_title',
			array(
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'render_type' => 'none',
			)
		);

		$active_breakpoint_keys = array_reverse( array_keys( Plugin::$instance->breakpoints->get_active_breakpoints() ) );
		$inline_size_device_args = array(
			Breakpoints_Manager::BREAKPOINT_KEY_MOBILE => array( 'placeholder' => 100 ),
		);

		foreach ( $active_breakpoint_keys as $breakpoint_key ) {
			if ( ! isset( $inline_size_device_args[ $breakpoint_key ] ) ) {
				$inline_size_device_args[ $breakpoint_key ] = array();
			}

			$inline_size_device_args[ $breakpoint_key ] = array_merge_recursive(
				$inline_size_device_args[ $breakpoint_key ],
				array(
					'max' => 100,
					'required' => false,
				)
			);
		}

		if ( in_array( Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA, $active_breakpoint_keys, true ) ) {
			$min_affected_device_value = Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA;
		} else {
			$min_affected_device_value = Breakpoints_Manager::BREAKPOINT_KEY_TABLET;
		}

		$this->add_responsive_control(
			'_inline_size',
			array(
				'label' => esc_html__( 'Column Width', 'elementor' ) . ' (%)',
				'type' => Controls_Manager::NUMBER,
				'min' => 2,
				'max' => 98,
				'required' => true,
				'device_args' => $inline_size_device_args,
				'min_affected_device' => array(
					Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP => $min_affected_device_value,
					Breakpoints_Manager::BREAKPOINT_KEY_LAPTOP => $min_affected_device_value,
					Breakpoints_Manager::BREAKPOINT_KEY_TABLET_EXTRA => $min_affected_device_value,
					Breakpoints_Manager::BREAKPOINT_KEY_TABLET => $min_affected_device_value,
					Breakpoints_Manager::BREAKPOINT_KEY_MOBILE_EXTRA => $min_affected_device_value,
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'width: {{VALUE}}%',
				),
			)
		);

		$this->add_responsive_control(
			'content_position',
			array(
				'label' => esc_html__( 'Vertical Alignment', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'top' => esc_html__( 'Top', 'elementor' ),
					'center' => esc_html__( 'Middle', 'elementor' ),
					'bottom' => esc_html__( 'Bottom', 'elementor' ),
					'space-between' => esc_html__( 'Space Between', 'elementor' ),
					'space-around' => esc_html__( 'Space Around', 'elementor' ),
					'space-evenly' => esc_html__( 'Space Evenly', 'elementor' ),
				),
				'selectors_dictionary' => array(
					'top' => 'flex-start',
					'bottom' => 'flex-end',
				),
				'selectors' => array(
					// TODO: The following line is for BC since 2.7.0
					'.elementor-bc-flex-widget {{WRAPPER}}.elementor-column .elementor-widget-wrap' => 'align-items: {{VALUE}}',
					// This specificity is intended to make sure column css overwrites section css on vertical alignment (content_position)
					'{{WRAPPER}}.elementor-column.elementor-element[data-element_type="column"] > .elementor-widget-wrap.elementor-element-populated' => 'align-content: {{VALUE}}; align-items: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'align',
			array(
				'label' => esc_html__( 'Horizontal Alignment', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'flex-start' => esc_html__( 'Start', 'elementor' ),
					'center' => esc_html__( 'Center', 'elementor' ),
					'flex-end' => esc_html__( 'End', 'elementor' ),
					'space-between' => esc_html__( 'Space Between', 'elementor' ),
					'space-around' => esc_html__( 'Space Around', 'elementor' ),
					'space-evenly' => esc_html__( 'Space Evenly', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}}.elementor-column > .elementor-widget-wrap' => 'justify-content: {{VALUE}}',
				),
			)
		);

		$this->add_responsive_control(
			'space_between_widgets',
			array(
				'label' => esc_html__( 'Widgets Space', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::NUMBER,
				'placeholder' => 20,
				'selectors' => array(
					'{{WRAPPER}} > .elementor-widget-wrap > .elementor-widget:not(.elementor-widget__width-auto):not(.elementor-widget__width-initial):not(:last-child):not(.elementor-absolute)' => 'margin-bottom: {{VALUE}}px', //Need the full path for exclude the inner section
				),
			)
		);

		$possible_tags = array(
			'div',
			'header',
			'footer',
			'main',
			'article',
			'section',
			'aside',
			'nav',
		);

		$options = array(
			'' => esc_html__( 'Default', 'elementor' ),
		) + array_combine( $possible_tags, $possible_tags );

		$this->add_control(
			'html_tag',
			array(
				'label' => esc_html__( 'HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => $options,
				'render_type' => 'none',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			array(
				'label' => esc_html__( 'Background', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->start_controls_tabs( 'tabs_background' );

		$this->start_controls_tab(
			'tab_background_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => 'background',
				'types' => array( 'classic', 'gradient', 'slideshow' ),
				'selector' => '{{WRAPPER}}:not(.elementor-motion-effects-element-type-background) > .elementor-widget-wrap, {{WRAPPER}} > .elementor-widget-wrap > .elementor-motion-effects-container > .elementor-motion-effects-layer',
				'fields_options' => array(
					'background' => array(
						'frontend_available' => true,
					),
				),
			)
		);

		$this->add_control(
			'handle_slideshow_asset_loading',
			array(
				'type' => Controls_Manager::HIDDEN,
				'assets' => array(
					'styles' => array(
						array(
							'name' => 'e-swiper',
							'conditions' => array(
								'terms' => array(
									array(
										'name' => 'background_background',
										'operator' => '===',
										'value' => 'slideshow',
									),
								),
							),
						),
					),
					'scripts' => array(
						array(
							'name' => 'swiper',
							'conditions' => array(
								'terms' => array(
									array(
										'name' => 'background_background',
										'operator' => '===',
										'value' => 'slideshow',
									),
								),
							),
						),
					),
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_background_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => 'background_hover',
				'selector' => '{{WRAPPER}}:hover > .elementor-element-populated',
			)
		);

		$this->add_control(
			'background_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 0.3,
				),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'render_type' => 'ui',
				'separator' => 'before',
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Column Background Overlay.
		$this->start_controls_section(
			'section_background_overlay',
			array(
				'label' => esc_html__( 'Background Overlay', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'background_background' => array( 'classic', 'gradient' ),
				),
			)
		);

		$this->start_controls_tabs( 'tabs_background_overlay' );

		$this->start_controls_tab(
			'tab_background_overlay_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => 'background_overlay',
				'selector' => '{{WRAPPER}} > .elementor-element-populated >  .elementor-background-overlay',
			)
		);

		$this->add_responsive_control(
			'background_overlay_opacity',
			array(
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => .5,
				),
				'range' => array(
					'px' => array(
						'max' => 1,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated >  .elementor-background-overlay' => 'opacity: {{SIZE}};',
				),
				'condition' => array(
					'background_overlay_background' => array( 'classic', 'gradient' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name' => 'css_filters',
				'selector' => '{{WRAPPER}} > .elementor-element-populated >  .elementor-background-overlay',
			)
		);

		$this->add_control(
			'overlay_blend_mode',
			array(
				'label' => esc_html__( 'Blend Mode', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Normal', 'elementor' ),
					'multiply' => esc_html__( 'Multiply', 'elementor' ),
					'screen' => esc_html__( 'Screen', 'elementor' ),
					'overlay' => esc_html__( 'Overlay', 'elementor' ),
					'darken' => esc_html__( 'Darken', 'elementor' ),
					'lighten' => esc_html__( 'Lighten', 'elementor' ),
					'color-dodge' => esc_html__( 'Color Dodge', 'elementor' ),
					'saturation' => esc_html__( 'Saturation', 'elementor' ),
					'color' => esc_html__( 'Color', 'elementor' ),
					'difference' => esc_html__( 'Difference', 'elementor' ),
					'exclusion' => esc_html__( 'Exclusion', 'elementor' ),
					'hue' => esc_html__( 'Hue', 'elementor' ),
					'luminosity' => esc_html__( 'Luminosity', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated > .elementor-background-overlay' => 'mix-blend-mode: {{VALUE}}',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_background_overlay_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => 'background_overlay_hover',
				'selector' => '{{WRAPPER}}:hover > .elementor-element-populated >  .elementor-background-overlay',
			)
		);

		$this->add_responsive_control(
			'background_overlay_hover_opacity',
			array(
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => .5,
				),
				'range' => array(
					'px' => array(
						'max' => 1,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}:hover > .elementor-element-populated >  .elementor-background-overlay' => 'opacity: {{SIZE}};',
				),
				'condition' => array(
					'background_overlay_hover_background' => array( 'classic', 'gradient' ),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name' => 'css_filters_hover',
				'selector' => '{{WRAPPER}}:hover > .elementor-element-populated >  .elementor-background-overlay',
			)
		);

		$this->add_control(
			'background_overlay_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 0.3,
				),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'render_type' => 'ui',
				'separator' => 'before',
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		$this->start_controls_section(
			'section_border',
			array(
				'label' => esc_html__( 'Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->start_controls_tabs( 'tabs_border' );

		$this->start_controls_tab(
			'tab_border_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'border',
				'selector' => '{{WRAPPER}} > .elementor-element-populated',
			)
		);

		$this->add_responsive_control(
			'border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated, {{WRAPPER}} > .elementor-element-populated > .elementor-background-overlay, {{WRAPPER}} > .elementor-background-slideshow' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => 'box_shadow',
				'selector' => '{{WRAPPER}} > .elementor-element-populated',
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_border_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'border_hover',
				'selector' => '{{WRAPPER}}:hover > .elementor-element-populated',
			)
		);

		$this->add_responsive_control(
			'border_radius_hover',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}}:hover > .elementor-element-populated, {{WRAPPER}}:hover > .elementor-element-populated > .elementor-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => 'box_shadow_hover',
				'selector' => '{{WRAPPER}}:hover > .elementor-element-populated',
			)
		);

		$this->add_control(
			'border_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'separator' => 'before',
				'default' => array(
					'size' => 0.3,
				),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'background_background',
							'operator' => '!==',
							'value' => '',
						),
						array(
							'name' => 'border_hover_border',
							'operator' => '!==',
							'value' => '',
						),
					),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated' => 'transition: background {{background_hover_transition.SIZE}}s, border {{SIZE}}s, border-radius {{SIZE}}s, box-shadow {{SIZE}}s',
					'{{WRAPPER}} > .elementor-element-populated > .elementor-background-overlay' => 'transition: background {{background_overlay_hover_transition.SIZE}}s, border-radius {{SIZE}}s, opacity {{background_overlay_hover_transition.SIZE}}s',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Typography.
		$this->start_controls_section(
			'section_typo',
			array(
				'label' => esc_html__( 'Typography', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'heading_color',
			array(
				'label' => esc_html__( 'Heading Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-element-populated .elementor-heading-title' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'color_text',
			array(
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'color_link',
			array(
				'label' => esc_html__( 'Link Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-element-populated a' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'color_link_hover',
			array(
				'label' => esc_html__( 'Link Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-element-populated a:hover' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'text_align',
			array(
				'label' => esc_html__( 'Text Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
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
					'justify' => array(
						'title' => esc_html__( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->end_controls_section();

		// Section Advanced.
		$this->start_controls_section(
			'section_advanced',
			array(
				'label' => esc_html__( 'Advanced', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->add_responsive_control(
			'margin',
			array(
				'label' => esc_html__( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};
					--e-column-margin-right: {{RIGHT}}{{UNIT}}; --e-column-margin-left: {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'padding',
			array(
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-element-populated' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_responsive_control(
			'z_index',
			array(
				'label' => esc_html__( 'Z-Index', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'selectors' => array(
					'{{WRAPPER}}' => 'z-index: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'_element_id',
			array(
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'ai' => array(
					'active' => false,
				),
				'dynamic' => array(
					'active' => true,
				),
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
				'classes' => 'elementor-control-direction-ltr',
			)
		);

		$this->add_control(
			'css_classes',
			array(
				'label' => esc_html__( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'ai' => array(
					'active' => false,
				),
				'dynamic' => array(
					'active' => true,
				),
				'prefix_class' => '',
				'title' => esc_html__( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
				'classes' => 'elementor-control-direction-ltr',
			)
		);

		Plugin::$instance->controls_manager->add_display_conditions_controls( $this );

		// TODO: Backward comparability for deprecated controls
		$this->add_control(
			'screen_sm',
			array(
				'type' => Controls_Manager::HIDDEN,
			)
		);

		$this->add_control(
			'screen_sm_width',
			array(
				'type' => Controls_Manager::HIDDEN,
				'condition' => array(
					'screen_sm' => array( 'custom' ),
				),
				'prefix_class' => 'elementor-sm-',
			)
		);
		// END Backward comparability

		$this->end_controls_section();

		$this->start_controls_section(
			'section_effects',
			array(
				'label' => esc_html__( 'Motion Effects', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		Plugin::$instance->controls_manager->add_motion_effects_promotion_control( $this );

		$this->add_responsive_control(
			'animation',
			array(
				'label' => esc_html__( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'animation_duration',
			array(
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'slow' => esc_html__( 'Slow', 'elementor' ),
					'' => esc_html__( 'Normal', 'elementor' ),
					'fast' => esc_html__( 'Fast', 'elementor' ),
				),
				'prefix_class' => 'animated-',
				'condition' => array(
					'animation!' => '',
				),
			)
		);

		$this->add_control(
			'animation_delay',
			array(
				'label' => esc_html__( 'Animation Delay', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => '',
				'min' => 0,
				'step' => 100,
				'condition' => array(
					'animation!' => '',
				),
				'render_type' => 'none',
				'frontend_available' => true,
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'_section_responsive',
			array(
				'label' => esc_html__( 'Responsive', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->add_control(
			'responsive_description',
			array(
				'raw' => sprintf(
					/* translators: 1: Link open tag, 2: Link close tag. */
					esc_html__( 'Responsive visibility will take effect only on %1$s preview mode %2$s or live page, and not while editing in Elementor.', 'elementor' ),
					'<a href="javascript: $e.run( \'panel/close\' )">',
					'</a>'
				),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-descriptor',
			)
		);

		$this->add_hidden_device_controls();

		$this->end_controls_section();

		Plugin::$instance->controls_manager->add_custom_attributes_controls( $this );

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}

	/**
	 * Render column output in the editor.
	 *
	 * Used to generate the live preview, using a Backbone JavaScript template.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<div class="elementor-widget-wrap">
			<div class="elementor-background-overlay"></div>
		</div>
		<?php
	}

	/**
	 * Before column rendering.
	 *
	 * Used to add stuff before the column element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function before_render() {
		$settings = $this->get_settings_for_display();

		$overlay_background = $settings['background_overlay_background'] ?? '';
		$overlay_hover_background = $settings['background_overlay_hover_background'] ?? '';

		$has_background_overlay = in_array( $overlay_background, array( 'classic', 'gradient' ), true ) ||
									in_array( $overlay_hover_background, array( 'classic', 'gradient' ), true );

		$column_wrap_classes = array( 'elementor-widget-wrap' );

		if ( $this->get_children() ) {
			$column_wrap_classes[] = 'elementor-element-populated';
		}

		$this->add_render_attribute( array(
			'_widget_wrapper' => array(
				'class' => $column_wrap_classes,
			),
			'_background_overlay' => array(
				'class' => array( 'elementor-background-overlay' ),
			),
		) );
		?>
		<<?php
		// PHPCS - the method get_html_tag is safe.
		echo $this->get_html_tag(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?> <?php $this->print_render_attribute_string( '_wrapper' ); ?>>
			<div <?php $this->print_render_attribute_string( '_widget_wrapper' ); ?>>
		<?php if ( $has_background_overlay ) : ?>
			<div <?php $this->print_render_attribute_string( '_background_overlay' ); ?>></div>
		<?php endif; ?>
		<?php
	}

	/**
	 * After column rendering.
	 *
	 * Used to add stuff after the column element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function after_render() {
		?>
			</div>
		</<?php
		// PHPCS - the method get_html_tag is safe.
		echo $this->get_html_tag(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?php
	}

	/**
	 * Add column render attributes.
	 *
	 * Used to add attributes to the current column wrapper HTML tag.
	 *
	 * @since 1.3.0
	 * @access protected
	 */
	protected function add_render_attributes() {

		$is_inner = $this->get_data( 'isInner' );

		$column_type = ! empty( $is_inner ) ? 'inner' : 'top';

		$settings = $this->get_settings();

		$this->add_render_attribute(
			'_wrapper', 'class', array(
				'elementor-column',
				'elementor-col-' . $settings['_column_size'],
				'elementor-' . $column_type . '-column',
			)
		);

		parent::add_render_attributes();
	}

	/**
	 * Get default child type.
	 *
	 * Retrieve the column child type based on element data.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param array $element_data Element ID.
	 *
	 * @return Element_Base|false Column default child type.
	 */
	protected function _get_default_child_type( array $element_data ) {
		if ( 'section' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'section' );
		}

		if ( 'container' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'container' );
		}

		// If the element doesn't exists (disabled element, experiment, etc.), return false to prevent errors.
		if ( empty( $element_data['widgetType'] ) ) {
			return false;
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	/**
	 * Get HTML tag.
	 *
	 * Retrieve the column element HTML tag.
	 *
	 * @since 1.5.3
	 * @access private
	 *
	 * @return string Column HTML tag.
	 */
	private function get_html_tag() {
		$html_tag = $this->get_settings( 'html_tag' );

		if ( empty( $html_tag ) ) {
			$html_tag = 'div';
		}

		return Utils::validate_html_tag( $html_tag );
	}
}
