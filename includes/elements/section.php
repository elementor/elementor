<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor section element.
 *
 * Elementor section handler class is responsible for initializing the section
 * element.
 *
 * @since 1.0.0
 */
class Element_Section extends Element_Base {

	/**
	 * Section predefined columns presets.
	 *
	 * Holds the predefined columns width for each columns count available by
	 * default by Elementor. Default is an empty array.
	 *
	 * Note that when the user creates a section he can define custom sizes for
	 * the columns. But Elementor sets default values for predefined columns.
	 *
	 * For example two columns 50% width each one, or three columns 33.33% each
	 * one. This property hold the data for those preset values.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 *
	 * @var array Section presets.
	 */
	private static $presets = array();

	/**
	 * Get element type.
	 *
	 * Retrieve the element type, in this case `section`.
	 *
	 * @since 2.1.0
	 * @access public
	 * @static
	 *
	 * @return string The type.
	 */
	public static function get_type() {
		return 'section';
	}

	/**
	 * Get section name.
	 *
	 * Retrieve the section name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Section name.
	 */
	public function get_name() {
		return 'section';
	}

	/**
	 * Get section title.
	 *
	 * Retrieve the section title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Section title.
	 */
	public function get_title() {
		return esc_html__( 'Section', 'elementor' );
	}

	/**
	 * Get section icon.
	 *
	 * Retrieve the section icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Section icon.
	 */
	public function get_icon() {
		return 'eicon-columns';
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Get presets.
	 *
	 * Retrieve a specific preset columns for a given columns count, or a list
	 * of all the preset if no parameters passed.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param int $columns_count Optional. Columns count. Default is null.
	 * @param int $preset_index  Optional. Preset index. Default is null.
	 *
	 * @return array Section presets.
	 */
	public static function get_presets( $columns_count = null, $preset_index = null ) {
		if ( ! self::$presets ) {
			self::init_presets();
		}

		$presets = self::$presets;

		if ( null !== $columns_count ) {
			$presets = $presets[ $columns_count ];
		}

		if ( null !== $preset_index ) {
			$presets = $presets[ $preset_index ];
		}

		return $presets;
	}

	/**
	 * Initialize presets.
	 *
	 * Initializing the section presets and set the number of columns the
	 * section can have by default. For example a column can have two columns
	 * 50% width each one, or three columns 33.33% each one.
	 *
	 * Note that Elementor sections have default section presets but the user
	 * can set custom number of columns and define custom sizes for each column.

	 * @since 1.0.0
	 * @access public
	 * @static
	 */
	public static function init_presets() {
		$additional_presets = array(
			2 => array(
				array(
					'preset' => array( 33, 66 ),
				),
				array(
					'preset' => array( 66, 33 ),
				),
			),
			3 => array(
				array(
					'preset' => array( 25, 25, 50 ),
				),
				array(
					'preset' => array( 50, 25, 25 ),
				),
				array(
					'preset' => array( 25, 50, 25 ),
				),
				array(
					'preset' => array( 16, 66, 16 ),
				),
			),
		);

		foreach ( range( 1, 10 ) as $columns_count ) {
			self::$presets[ $columns_count ] = array(
				array(
					'preset' => array(),
				),
			);

			$preset_unit = floor( 1 / $columns_count * 100 );

			for ( $i = 0; $i < $columns_count; $i++ ) {
				self::$presets[ $columns_count ][0]['preset'][] = $preset_unit;
			}

			if ( ! empty( $additional_presets[ $columns_count ] ) ) {
				self::$presets[ $columns_count ] = array_merge( self::$presets[ $columns_count ], $additional_presets[ $columns_count ] );
			}

			foreach ( self::$presets[ $columns_count ] as $preset_index => & $preset ) {
				$preset['key'] = $columns_count . $preset_index;
			}
		}
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

		$config['presets'] = self::get_presets();
		$config['controls'] = $this->get_controls();
		$config['tabs_controls'] = $this->get_tabs_controls();

		return $config;
	}

	/**
	 * Register section controls.
	 *
	 * Used to add new controls to the section element.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_layout',
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

		$this->add_control(
			'layout',
			array(
				'label' => esc_html__( 'Content Width', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'boxed',
				'options' => array(
					'boxed' => esc_html__( 'Boxed', 'elementor' ),
					'full_width' => esc_html__( 'Full Width', 'elementor' ),
				),
				'prefix_class' => 'elementor-section-',
			)
		);

		$this->add_responsive_control(
			'content_width',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 500,
						'max' => 1600,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-container' => 'max-width: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'layout' => array( 'boxed' ),
				),
			)
		);

		$this->add_control(
			'gap',
			array(
				'label' => esc_html__( 'Columns Gap', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'no' => esc_html__( 'No Gap', 'elementor' ),
					'narrow' => esc_html__( 'Narrow', 'elementor' ),
					'extended' => esc_html__( 'Extended', 'elementor' ),
					'wide' => esc_html__( 'Wide', 'elementor' ),
					'wider' => esc_html__( 'Wider', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
			)
		);

		$this->add_responsive_control(
			'gap_columns_custom',
			array(
				'label' => esc_html__( 'Custom Columns Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'max' => 500,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-column-gap-custom .elementor-column > .elementor-element-populated' => 'padding: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'gap' => 'custom',
				),
			)
		);

		$this->add_control(
			'height',
			array(
				'label' => esc_html__( 'Height', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'full' => esc_html__( 'Fit To Screen', 'elementor' ),
					'min-height' => esc_html__( 'Min Height', 'elementor' ),
				),
				'prefix_class' => 'elementor-section-height-',
				'hide_in_inner' => true,
			)
		);

		$this->add_responsive_control(
			'custom_height',
			array(
				'label' => esc_html__( 'Minimum Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 400,
				),
				'range' => array(
					'px' => array(
						'max' => 1440,
					),
				),
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'vw', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-container' => 'min-height: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'height' => array( 'min-height' ),
				),
				'hide_in_inner' => true,
			)
		);

		$this->add_control(
			'height_inner',
			array(
				'label' => esc_html__( 'Height', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'full' => esc_html__( 'Fit To Screen', 'elementor' ),
					'min-height' => esc_html__( 'Min Height', 'elementor' ),
				),
				'prefix_class' => 'elementor-section-height-',
				'hide_in_top' => true,
			)
		);

		$this->add_responsive_control(
			'custom_height_inner',
			array(
				'label' => esc_html__( 'Minimum Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 400,
				),
				'range' => array(
					'px' => array(
						'max' => 1440,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-container' => 'min-height: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'height_inner' => array( 'min-height' ),
				),
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'vw', 'custom' ),
				'hide_in_top' => true,
			)
		);

		$this->add_control(
			'column_position',
			array(
				'label' => esc_html__( 'Column Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'middle',
				'options' => array(
					'stretch' => esc_html__( 'Stretch', 'elementor' ),
					'top' => esc_html__( 'Top', 'elementor' ),
					'middle' => esc_html__( 'Middle', 'elementor' ),
					'bottom' => esc_html__( 'Bottom', 'elementor' ),
				),
				'prefix_class' => 'elementor-section-items-',
				'condition' => array(
					'height' => array( 'full', 'min-height' ),
				),
			)
		);

		$this->add_control(
			'content_position',
			array(
				'label' => esc_html__( 'Vertical Align', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'top' => esc_html__( 'Top', 'elementor' ),
					'middle' => esc_html__( 'Middle', 'elementor' ),
					'bottom' => esc_html__( 'Bottom', 'elementor' ),
					'space-between' => esc_html__( 'Space Between', 'elementor' ),
					'space-around' => esc_html__( 'Space Around', 'elementor' ),
					'space-evenly' => esc_html__( 'Space Evenly', 'elementor' ),
				),
				'selectors_dictionary' => array(
					'top' => 'flex-start',
					'middle' => 'center',
					'bottom' => 'flex-end',
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-container > .elementor-column > .elementor-widget-wrap' => 'align-content: {{VALUE}}; align-items: {{VALUE}};',
				),
				// TODO: The following line is for BC since 2.7.0
				'prefix_class' => 'elementor-section-content-',
			)
		);

		$this->add_control(
			'overflow',
			array(
				'label' => esc_html__( 'Overflow', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'hidden' => esc_html__( 'Hidden', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'overflow: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'stretch_section',
			array(
				'label' => esc_html__( 'Stretch Section', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => '',
				'return_value' => 'section-stretched',
				'prefix_class' => 'elementor-',
				'hide_in_inner' => true,
				'description' => sprintf(
					'%1$s <a href="https://go.elementor.com/stretch-section/" target="_blank">%2$s</a>',
					esc_html__( 'Stretch the section to the full width of the page using JS.', 'elementor' ),
					esc_html__( 'Learn more', 'elementor' )
				),
				'render_type' => 'none',
				'frontend_available' => true,
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
				'separator' => 'before',
			)
		);

		$this->end_controls_section();

		// Section Structure
		$this->start_controls_section(
			'section_structure',
			array(
				'label' => esc_html__( 'Structure', 'elementor' ),
				'tab' => Controls_Manager::TAB_LAYOUT,
			)
		);

		$this->add_control(
			'structure',
			array(
				'label' => esc_html__( 'Structure', 'elementor' ),
				'type' => Controls_Manager::STRUCTURE,
				'default' => '10',
				'render_type' => 'none',
				'style_transfer' => false,
			)
		);

		$this->end_controls_section();

		// Section background
		$this->start_controls_section(
			'section_background',
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
				'types' => array( 'classic', 'gradient', 'video', 'slideshow' ),
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
				'selector' => '{{WRAPPER}}:hover',
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

		// Background Overlay
		$this->start_controls_section(
			'section_background_overlay',
			array(
				'label' => esc_html__( 'Background Overlay', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
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
				'selector' => '{{WRAPPER}} > .elementor-background-overlay',
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
					'{{WRAPPER}} > .elementor-background-overlay' => 'opacity: {{SIZE}};',
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
				'selector' => '{{WRAPPER}} .elementor-background-overlay',
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'background_overlay_image[url]',
							'operator' => '!==',
							'value' => '',
						),
						array(
							'name' => 'background_overlay_color',
							'operator' => '!==',
							'value' => '',
						),
					),
				),
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
					'luminosity' => esc_html__( 'Luminosity', 'elementor' ),
					'difference' => esc_html__( 'Difference', 'elementor' ),
					'exclusion' => esc_html__( 'Exclusion', 'elementor' ),
					'hue' => esc_html__( 'Hue', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}} > .elementor-background-overlay' => 'mix-blend-mode: {{VALUE}}',
				),
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'background_overlay_image[url]',
							'operator' => '!==',
							'value' => '',
						),
						array(
							'name' => 'background_overlay_color',
							'operator' => '!==',
							'value' => '',
						),
					),
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
				'selector' => '{{WRAPPER}}:hover > .elementor-background-overlay',
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
					'{{WRAPPER}}:hover > .elementor-background-overlay' => 'opacity: {{SIZE}};',
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
				'selector' => '{{WRAPPER}}:hover > .elementor-background-overlay',
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

		// Section border
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
			)
		);

		$this->add_responsive_control(
			'border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}}, {{WRAPPER}} > .elementor-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => 'box_shadow',
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
				'selector' => '{{WRAPPER}}:hover',
			)
		);

		$this->add_responsive_control(
			'border_radius_hover',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}}:hover, {{WRAPPER}}:hover > .elementor-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => 'box_shadow_hover',
				'selector' => '{{WRAPPER}}:hover',
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
					'{{WRAPPER}}' => 'transition: background {{background_hover_transition.SIZE}}s, border {{SIZE}}s, border-radius {{SIZE}}s, box-shadow {{SIZE}}s',
					'{{WRAPPER}} > .elementor-background-overlay' => 'transition: background {{background_overlay_hover_transition.SIZE}}s, border-radius {{SIZE}}s, opacity {{background_overlay_hover_transition.SIZE}}s',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Shape Divider
		$this->start_controls_section(
			'section_shape_divider',
			array(
				'label' => esc_html__( 'Shape Divider', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->start_controls_tabs( 'tabs_shape_dividers' );

		$shapes_options = array(
			'' => esc_html__( 'None', 'elementor' ),
		);

		foreach ( Shapes::get_shapes() as $shape_name => $shape_props ) {
			$shapes_options[ $shape_name ] = $shape_props['title'];
		}

		foreach ( array(
			'top' => esc_html__( 'Top', 'elementor' ),
			'bottom' => esc_html__( 'Bottom', 'elementor' ),
		) as $side => $side_label ) {
			$base_control_key = "shape_divider_$side";

			$this->start_controls_tab(
				"tab_$base_control_key",
				array(
					'label' => $side_label,
				)
			);

			$this->add_control(
				$base_control_key,
				array(
					'label' => esc_html__( 'Type', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'options' => $shapes_options,
					'render_type' => 'none',
					'frontend_available' => true,
					'assets' => array(
						'styles' => array(
							array(
								'name' => 'e-shapes',
								'conditions' => array(
									'terms' => array(
										array(
											'name' => $base_control_key,
											'operator' => '!==',
											'value' => '',
										),
									),
								),
							),
						),
					),
				)
			);

			$this->add_control(
				$base_control_key . '_color',
				array(
					'label' => esc_html__( 'Color', 'elementor' ),
					'type' => Controls_Manager::COLOR,
					'condition' => array(
						"shape_divider_$side!" => '',
					),
					'selectors' => array(
						"{{WRAPPER}} > .elementor-shape-$side .elementor-shape-fill" => 'fill: {{UNIT}};',
					),
				)
			);

			$this->add_responsive_control(
				$base_control_key . '_width',
				array(
					'label' => esc_html__( 'Width', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'size_units' => array( '%', 'vw', 'custom' ),
					'default' => array(
						'unit' => '%',
					),
					'tablet_default' => array(
						'unit' => '%',
					),
					'mobile_default' => array(
						'unit' => '%',
					),
					'range' => array(
						'%' => array(
							'min' => 100,
							'max' => 300,
						),
						'vw' => array(
							'min' => 100,
							'max' => 300,
						),
					),
					'condition' => array(
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'height_only', Shapes::FILTER_EXCLUDE ) ),
					),
					'selectors' => array(
						"{{WRAPPER}} > .elementor-shape-$side svg" => 'width: calc({{SIZE}}{{UNIT}} + 1.3px)',
					),
				)
			);

			$this->add_responsive_control(
				$base_control_key . '_height',
				array(
					'label' => esc_html__( 'Height', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'size_units' => array( 'px', 'em', 'rem', 'custom' ),
					'range' => array(
						'px' => array(
							'max' => 500,
						),
						'em' => array(
							'max' => 50,
						),
						'rem' => array(
							'max' => 50,
						),
					),
					'condition' => array(
						"shape_divider_$side!" => '',
					),
					'selectors' => array(
						"{{WRAPPER}} > .elementor-shape-$side svg" => 'height: {{SIZE}}{{UNIT}};',
					),
				)
			);

			$this->add_control(
				$base_control_key . '_flip',
				array(
					'label' => esc_html__( 'Flip', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'condition' => array(
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'has_flip' ) ),
					),
					'selectors' => array(
						"{{WRAPPER}} > .elementor-shape-$side svg" => 'transform: translateX(-50%) rotateY(180deg)',
					),
				)
			);

			$this->add_control(
				$base_control_key . '_negative',
				array(
					'label' => esc_html__( 'Invert', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'frontend_available' => true,
					'condition' => array(
						"shape_divider_$side" => array_keys( Shapes::filter_shapes( 'has_negative' ) ),
					),
					'render_type' => 'none',
				)
			);

			$this->add_control(
				$base_control_key . '_above_content',
				array(
					'label' => esc_html__( 'Bring to Front', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'selectors' => array(
						"{{WRAPPER}} > .elementor-shape-$side" => 'z-index: 2; pointer-events: none',
					),
					'condition' => array(
						"shape_divider_$side!" => '',
					),
				)
			);

			$this->end_controls_tab();
		}

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Typography
		$this->start_controls_section(
			'section_typo',
			array(
				'label' => esc_html__( 'Typography', 'elementor' ),
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
					'{{WRAPPER}} .elementor-heading-title' => 'color: {{VALUE}};',
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
					'{{WRAPPER}}' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} a' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} a:hover' => 'color: {{VALUE}};',
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
					'{{WRAPPER}} > .elementor-container' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->end_controls_section();

		// Section Advanced
		$this->start_controls_section(
			'section_advanced',
			array(
				'label' => esc_html__( 'Advanced', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->add_responsive_control(
			'margin',
			array(
				'label' => esc_html__( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'allowed_dimensions' => 'vertical',
				'placeholder' => array(
					'top' => '',
					'right' => 'auto',
					'bottom' => '',
					'left' => 'auto',
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'margin-top: {{TOP}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
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
					'{{WRAPPER}}' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
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

		// Section Responsive
		$this->start_controls_section(
			'_section_responsive',
			array(
				'label' => esc_html__( 'Responsive', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		// The controls should be displayed from largest to smallest breakpoint, so we reverse the array.
		$active_breakpoints = array_reverse( Plugin::$instance->breakpoints->get_active_breakpoints() );

		foreach ( $active_breakpoints as $breakpoint_key => $breakpoint ) {
			$this->add_control(
				'reverse_order_' . $breakpoint_key,
				array(
					'label' => esc_html__( 'Reverse Columns', 'elementor' ) . ' (' . $breakpoint->get_label() . ')',
					'type' => Controls_Manager::SWITCHER,
					'default' => '',
					'prefix_class' => 'elementor-',
					'return_value' => 'reverse-' . $breakpoint_key,
				)
			);
		}

		$this->add_control(
			'heading_visibility',
			array(
				'label' => esc_html__( 'Visibility', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
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
	 * Render section output in the editor.
	 *
	 * Used to generate the live preview, using a Backbone JavaScript template.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		if ( settings.background_video_link ) {
			let videoAttributes = 'autoplay muted playsinline';

			if ( ! settings.background_play_once ) {
				videoAttributes += ' loop';
			}

			view.addRenderAttribute( 'background-video-container', 'class', 'elementor-background-video-container' );

			if ( ! settings.background_play_on_mobile ) {
				view.addRenderAttribute( 'background-video-container', 'class', 'elementor-hidden-mobile' );
			}
		#>
			<div {{{ view.getRenderAttributeString( 'background-video-container' ) }}}>
				<div class="elementor-background-video-embed"></div>
				<video class="elementor-background-video-hosted" {{ videoAttributes }}></video>
			</div>
		<# } #>
		<div class="elementor-background-overlay"></div>
		<div class="elementor-shape elementor-shape-top"></div>
		<div class="elementor-shape elementor-shape-bottom"></div>
		<div class="elementor-container elementor-column-gap-{{ settings.gap }}"></div>
		<?php
	}

	/**
	 * Before section rendering.
	 *
	 * Used to add stuff before the section element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function before_render() {
		$settings = $this->get_settings_for_display();
		?>
		<<?php
			// PHPCS - the method get_html_tag is safe.
			echo $this->get_html_tag(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?> <?php $this->print_render_attribute_string( '_wrapper' ); ?>>
			<?php
			if ( 'video' === $settings['background_background'] ) :
				if ( $settings['background_video_link'] ) :
					$video_properties = Embed::get_video_properties( $settings['background_video_link'] );

					$this->add_render_attribute( 'background-video-container', 'class', 'elementor-background-video-container' );

					if ( ! $settings['background_play_on_mobile'] ) {
						$this->add_render_attribute( 'background-video-container', 'class', 'elementor-hidden-mobile' );
					}
					?>
					<div <?php $this->print_render_attribute_string( 'background-video-container' ); ?>>
						<?php if ( $video_properties ) : ?>
							<div class="elementor-background-video-embed"></div>
							<?php
						else :
							$video_tag_attributes = 'autoplay muted playsinline';
							if ( 'yes' !== $settings['background_play_once'] ) :
								$video_tag_attributes .= ' loop';
							endif;
							?>
							<video class="elementor-background-video-hosted" <?php
								// PHPCS - the variable $video_tag_attributes is a plain string.
								echo $video_tag_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>></video>
						<?php endif; ?>
					</div>
					<?php
				endif;
			endif;

			$overlay_background = $settings['background_overlay_background'] ?? '';
			$overlay_hover_background = $settings['background_overlay_hover_background'] ?? '';

			$has_background_overlay = in_array( $overlay_background, array( 'classic', 'gradient' ), true ) ||
									in_array( $overlay_hover_background, array( 'classic', 'gradient' ), true );

			if ( $has_background_overlay ) :
				?>
				<div class="elementor-background-overlay"></div>
				<?php
			endif;

			if ( $settings['shape_divider_top'] ) {
				$this->print_shape_divider( 'top' );
			}

			if ( $settings['shape_divider_bottom'] ) {
				$this->print_shape_divider( 'bottom' );
			}
			?>
			<div class="elementor-container elementor-column-gap-<?php echo esc_attr( $settings['gap'] ); ?>">
			<?php
	}

	/**
	 * After section rendering.
	 *
	 * Used to add stuff after the section element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function after_render() {
		?>
			</div>
		</<?php
			// PHPCS - the method get_html_tag is safe.
			echo $this->get_html_tag(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>>
		<?php
	}

	/**
	 * Add section render attributes.
	 *
	 * Used to add attributes to the current section wrapper HTML tag.
	 *
	 * @since 1.3.0
	 * @access protected
	 */
	protected function add_render_attributes() {

		$section_type = $this->get_data( 'isInner' ) ? 'inner' : 'top';

		$this->add_render_attribute(
			'_wrapper', 'class', array(
				'elementor-section',
				'elementor-' . $section_type . '-section',
			)
		);

		parent::add_render_attributes();
	}

	/**
	 * Get default child type.
	 *
	 * Retrieve the section child type based on element data.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param array $element_data Element ID.
	 *
	 * @return Element_Base Section default child type.
	 */
	protected function _get_default_child_type( array $element_data ) {
		return Plugin::$instance->elements_manager->get_element_types( 'column' );
	}

	/**
	 * Get HTML tag.
	 *
	 * Retrieve the section element HTML tag.
	 *
	 * @since 1.5.3
	 * @access private
	 *
	 * @return string Section HTML tag.
	 */
	protected function get_html_tag() {
		$html_tag = $this->get_settings( 'html_tag' );

		if ( empty( $html_tag ) ) {
			$html_tag = 'section';
		}

		return Utils::validate_html_tag( $html_tag );
	}

	/**
	 * Print section shape divider.
	 *
	 * Used to generate the shape dividers HTML.
	 *
	 * @since 1.3.0
	 * @access private
	 *
	 * @param string $side Shape divider side, used to set the shape key.
	 */
	protected function print_shape_divider( $side ) {
		$settings = $this->get_active_settings();
		$base_setting_key = "shape_divider_$side";
		$negative = ! empty( $settings[ $base_setting_key . '_negative' ] );
		$shape_path = Shapes::get_shape_path( $settings[ $base_setting_key ], $negative );
		if ( ! is_file( $shape_path ) || ! is_readable( $shape_path ) ) {
			return;
		}

		?>
		<div class="elementor-shape elementor-shape-<?php echo esc_attr( $side ); ?>" data-negative="<?php
			Utils::print_unescaped_internal_string( $negative ? 'true' : 'false' );
		?>">
			<?php
				// PHPCS - The file content is being read from a strict file path structure.
				echo Utils::file_get_contents( $shape_path ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		</div>
		<?php
	}
}
