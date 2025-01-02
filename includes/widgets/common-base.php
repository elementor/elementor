<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor common widget.
 *
 * Elementor base widget that gives you all the advanced options of the basic
 * widget.
 *
 * @since 1.0.0
 */
class Widget_Common_Base extends Widget_Base {

	const WRAPPER_SELECTOR = '{{WRAPPER}} .elementor-widget-container';
	const WRAPPER_SELECTOR_CHILD = '{{WRAPPER}} > .elementor-widget-container';
	const WRAPPER_SELECTOR_HOVER = '{{WRAPPER}}:hover .elementor-widget-container';
	const WRAPPER_SELECTOR_HOVER_CHILD = '{{WRAPPER}}:hover > .elementor-widget-container';
	const MASK_SELECTOR_DEFAULT = '{{WRAPPER}}:not( .elementor-widget-image ) .elementor-widget-container';
	const MASK_SELECTOR_IMG = '{{WRAPPER}}.elementor-widget-image .elementor-widget-container img';
	const TRANSFORM_SELECTOR_CLASS = ' > .elementor-widget-container';
	const MARGIN = 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};';

	/**
	 * Get widget name.
	 *
	 * Retrieve common widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'common-base';
	}

	/**
	 * Show in panel.
	 *
	 * Whether to show the common widget in the panel or not.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return bool Whether to show the widget in the panel.
	 */
	public function show_in_panel() {
		return false;
	}

	/**
	 * Get Responsive Device Args
	 *
	 * Receives an array of device args, and duplicates it for each active breakpoint.
	 * Returns an array of device args.
	 *
	 * @since 3.4.7
	 * @deprecated 3.7.0 Not needed anymore because responsive conditioning in the Editor was fixed in v3.7.0.
	 * @access protected
	 *
	 * @param array $args arguments to duplicate per breakpoint
	 * @param array $devices_to_exclude
	 *
	 * @return array responsive device args
	 */
	protected function get_responsive_device_args( array $args, array $devices_to_exclude = array() ) {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function( __METHOD__, '3.7.0' );

		$device_args = array();
		$breakpoints = Plugin::$instance->breakpoints->get_active_breakpoints();

		foreach ( $breakpoints as $breakpoint_key => $breakpoint ) {
			// If the device is not excluded, add it to the device args array.
			if ( ! in_array( $breakpoint_key, $devices_to_exclude, true ) ) {
				$parsed_device_args = $this->parse_device_args_placeholders( $args, $breakpoint_key );

				$device_args[ $breakpoint_key ] = $parsed_device_args;
			}
		}

		return $device_args;
	}

	/**
	 * Parse Device Args Placeholders
	 *
	 * Receives an array of args. Iterates over the args, and replaces the {{DEVICE}} placeholder, if exists, with the
	 * passed breakpoint key.
	 *
	 * @since 3.4.7
	 * @access private
	 *
	 * @param array $args
	 * @param string $breakpoint_key
	 * @return array parsed device args
	 */
	private function parse_device_args_placeholders( array $args, $breakpoint_key ) {
		$parsed_args = array();

		foreach ( $args as $arg_key => $arg_value ) {
			$arg_key = str_replace( '{{DEVICE}}', $breakpoint_key, $arg_key );

			if ( is_array( $arg_value ) ) {
				$arg_value = $this->parse_device_args_placeholders( $arg_value, $breakpoint_key );
			}

			$parsed_args[ $arg_key ] = $arg_value;
		}

		return $parsed_args;
	}

	/**
	 * @param $shape String Shape name.
	 *
	 * @return string The shape path in the assets folder.
	 */
	private function get_shape_url( $shape ) {
		return ELEMENTOR_ASSETS_URL . 'mask-shapes/' . $shape . '.svg';
	}

	/**
	 * Return a translated user-friendly list of the available masking shapes.
	 *
	 * @param bool $add_custom Determine if the output should contain `Custom` options.
	 *
	 * @return array Array of shapes with their URL as key.
	 */
	private function get_shapes( $add_custom = true ) {
		$shapes = array(
			'circle' => esc_html__( 'Circle', 'elementor' ),
			'flower' => esc_html__( 'Flower', 'elementor' ),
			'sketch' => esc_html__( 'Sketch', 'elementor' ),
			'triangle' => esc_html__( 'Triangle', 'elementor' ),
			'blob' => esc_html__( 'Blob', 'elementor' ),
			'hexagon' => esc_html__( 'Hexagon', 'elementor' ),
		);

		if ( $add_custom ) {
			$shapes['custom'] = esc_html__( 'Custom', 'elementor' );
		}

		return $shapes;
	}

	/**
	 * Gets a string of CSS rules to apply, and returns an array of selectors with those rules.
	 * This function has been created in order to deal with masking for image widget.
	 * For most of the widgets the mask is being applied to the wrapper itself, but in the case of an image widget,
	 * the `img` tag should be masked directly. So instead of writing a lot of selectors every time,
	 * this function builds both of those selectors easily.
	 *
	 * @param $rules string The CSS rules to apply.
	 *
	 * @return array Selectors with the rules applied.
	 */
	private function get_mask_selectors( $rules ) {
		$mask_selectors = array(
			'default' => static::MASK_SELECTOR_DEFAULT,
			'image' => static::MASK_SELECTOR_IMG,
		);

		return array(
			$mask_selectors['default'] => $rules,
			$mask_selectors['image'] => $rules,
		);
	}

	/**
	 * Register the Layout section.
	 *
	 * @return void
	 */
	private function register_layout_section() {
		$this->start_controls_section(
			'_section_style',
			array(
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
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

		$this->add_responsive_control(
			'_margin',
			array(
				'label' => esc_html__( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors' => array(
					static::WRAPPER_SELECTOR_CHILD => static::MARGIN,
				),
			)
		);

		$this->add_responsive_control(
			'_padding',
			array(
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors' => array(
					static::WRAPPER_SELECTOR_CHILD => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$experiments_manager = Plugin::$instance->experiments;
		$is_container_active = $experiments_manager->is_feature_active( 'container' );

		$this->add_responsive_control(
			'_element_width',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'inherit' => esc_html__( 'Full Width', 'elementor' ) . ' (100%)',
					'auto' => esc_html__( 'Inline', 'elementor' ) . ' (auto)',
					'initial' => esc_html__( 'Custom', 'elementor' ),
				),
				'selectors_dictionary' => array(
					'inherit' => '100%',
				),
				'prefix_class' => 'elementor-widget%s__width-',
				'selectors' => array(
					'{{WRAPPER}}' => 'width: {{VALUE}}; max-width: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'_heading_grid_item',
			array(
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Grid Item', 'elementor' ),
				'separator' => 'before',
			)
		);

		$this->add_responsive_control(
			'_grid_column',
			array(
				'label' => esc_html__( 'Column Span', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '1',
				'options' => array(
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
					'7' => '7',
					'8' => '8',
					'9' => '9',
					'10' => '10',
					'11' => '11',
					'12' => '12',
					'custom' => 'Custom',
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'grid-column: span {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'_grid_column_custom',
			array(
				'label' => esc_html__( 'Custom', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'ai' => array(
					'active' => false,
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'grid-column: {{VALUE}}',
				),
				'condition' => array(
					'_grid_column' => 'custom',
				),
			)
		);

		$this->add_responsive_control(
			'_grid_row',
			array(
				'label' => esc_html__( 'Row Span', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '1',
				'options' => array(
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
					'7' => '7',
					'8' => '8',
					'9' => '9',
					'10' => '10',
					'11' => '11',
					'12' => '12',
					'custom' => 'Custom',
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'grid-row: span {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'_grid_row_custom',
			array(
				'label' => esc_html__( 'Custom', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'separator' => 'after',
				'ai' => array(
					'active' => false,
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'grid-row: {{VALUE}}',
				),
				'condition' => array(
					'_grid_row' => 'custom',
				),
			)
		);

		$this->add_responsive_control(
			'_element_custom_width',
			array(
				'label' => esc_html__( 'Custom Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'default' => array(
					'unit' => '%',
				),
				'range' => array(
					'px' => array(
						'max' => 1000,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--container-widget-width: {{SIZE}}{{UNIT}}; --container-widget-flex-grow: 0; width: var( --container-widget-width, {{SIZE}}{{UNIT}} ); max-width: {{SIZE}}{{UNIT}}',
				),
				'condition' => array( '_element_width' => 'initial' ),
			)
		);

		// Register Flex controls only if the Container experiment is active.
		if ( $is_container_active ) {
			$this->add_group_control(
				Group_Control_Flex_Item::get_type(),
				array(
					'name' => '_flex',
					// Hack to increase specificity and make sure that the current widget overrides the
					// parent flex settings.
					'selector' => '{{WRAPPER}}.elementor-element',
					'include' => array(
						'align_self',
						'order',
						'order_custom',
						'size',
						'grow',
						'shrink',
					),
					'fields_options' => array(
						'align_self' => array(
							'separator' => 'before',
						),
					),
				)
			);
		}

		$vertical_align_conditions = array(
			'_element_width!' => '',
			'_position' => '',
		);

		if ( $is_container_active ) {
			$vertical_align_conditions['_element_vertical_align!'] = ''; // TODO: For BC.
		}

		// TODO: For BC - Remove in the future.
		$this->add_responsive_control(
			'_element_vertical_align',
			array(
				'label' => esc_html__( 'Vertical Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'flex-start' => array(
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					),
					'flex-end' => array(
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					),
				),
				'condition' => $vertical_align_conditions,
				'selectors' => array(
					'{{WRAPPER}}' => 'align-self: {{VALUE}}',
				),
			)
		);

		$this->add_control(
			'_position_description',
			array(
				'type' => Controls_Manager::ALERT,
				'alert_type' => 'warning',
				'heading' => esc_html__( 'Please note!', 'elementor' ),
				'content' => esc_html__( 'Custom positioning is not considered best practice for responsive web design and should not be used too frequently.', 'elementor' ),
				'render_type' => 'ui',
				'condition' => array(
					'_position!' => '',
				),
			)
		);

		$this->add_control(
			'_position',
			array(
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'absolute' => esc_html__( 'Absolute', 'elementor' ),
					'fixed' => esc_html__( 'Fixed', 'elementor' ),
				),
				'prefix_class' => 'elementor-',
				'frontend_available' => true,
				'separator' => 'before',
			)
		);

		$start = is_rtl() ? esc_html__( 'Right', 'elementor' ) : esc_html__( 'Left', 'elementor' );
		$end = ! is_rtl() ? esc_html__( 'Right', 'elementor' ) : esc_html__( 'Left', 'elementor' );

		$this->add_control(
			'_offset_orientation_h',
			array(
				'label' => esc_html__( 'Horizontal Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => array(
					'start' => array(
						'title' => $start,
						'icon' => 'eicon-h-align-left',
					),
					'end' => array(
						'title' => $end,
						'icon' => 'eicon-h-align-right',
					),
				),
				'classes' => 'elementor-control-start-end',
				'render_type' => 'ui',
				'condition' => array(
					'_position!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_offset_x',
			array(
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => -1000,
						'max' => 1000,
					),
					'%' => array(
						'min' => -200,
						'max' => 200,
					),
					'vw' => array(
						'min' => -200,
						'max' => 200,
					),
					'vh' => array(
						'min' => -200,
						'max' => 200,
					),
				),
				'default' => array(
					'size' => 0,
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ),
				'selectors' => array(
					'body:not(.rtl) {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
				),
				'condition' => array(
					'_offset_orientation_h!' => 'end',
					'_position!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_offset_x_end',
			array(
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => -1000,
						'max' => 1000,
					),
					'%' => array(
						'min' => -200,
						'max' => 200,
					),
					'vw' => array(
						'min' => -200,
						'max' => 200,
					),
					'vh' => array(
						'min' => -200,
						'max' => 200,
					),
				),
				'default' => array(
					'size' => 0,
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'vh', 'custom' ),
				'selectors' => array(
					'body:not(.rtl) {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
				),
				'condition' => array(
					'_offset_orientation_h' => 'end',
					'_position!' => '',
				),
			)
		);

		$this->add_control(
			'_offset_orientation_v',
			array(
				'label' => esc_html__( 'Vertical Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => array(
					'start' => array(
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
					'end' => array(
						'title' => esc_html__( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					),
				),
				'render_type' => 'ui',
				'condition' => array(
					'_position!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_offset_y',
			array(
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => -1000,
						'max' => 1000,
					),
					'%' => array(
						'min' => -200,
						'max' => 200,
					),
					'vh' => array(
						'min' => -200,
						'max' => 200,
					),
					'vw' => array(
						'min' => -200,
						'max' => 200,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ),
				'default' => array(
					'size' => 0,
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'top: {{SIZE}}{{UNIT}}',
				),
				'condition' => array(
					'_offset_orientation_v!' => 'end',
					'_position!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_offset_y_end',
			array(
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => -1000,
						'max' => 1000,
					),
					'%' => array(
						'min' => -200,
						'max' => 200,
					),
					'vh' => array(
						'min' => -200,
						'max' => 200,
					),
					'vw' => array(
						'min' => -200,
						'max' => 200,
					),
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vh', 'vw', 'custom' ),
				'default' => array(
					'size' => 0,
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'bottom: {{SIZE}}{{UNIT}}',
				),
				'condition' => array(
					'_offset_orientation_v' => 'end',
					'_position!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_z_index',
			array(
				'label' => esc_html__( 'Z-Index', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
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
				'dynamic' => array(
					'active' => true,
				),
				'ai' => array(
					'active' => false,
				),
				'default' => '',
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
				'classes' => 'elementor-control-direction-ltr',
			)
		);

		$this->add_control(
			'_css_classes',
			array(
				'label' => esc_html__( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
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
	}

	/**
	 * Register the Motion Effects section.
	 *
	 * @return void
	 */
	private function register_effects_section() {
		$this->start_controls_section(
			'section_effects',
			array(
				'label' => esc_html__( 'Motion Effects', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		Plugin::$instance->controls_manager->add_motion_effects_promotion_control( $this );

		$this->add_responsive_control(
			'_animation',
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
					'_animation!' => '',
				),
			)
		);

		$this->add_control(
			'_animation_delay',
			array(
				'label' => esc_html__( 'Animation Delay', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => '',
				'min' => 0,
				'step' => 100,
				'condition' => array(
					'_animation!' => '',
				),
				'render_type' => 'none',
				'frontend_available' => true,
			)
		);

		$this->end_controls_section();
	}

	/** Register the Background section.
	 *
	 * @return void
	 */
	private function register_background_section() {
		$this->start_controls_section(
			'_section_background',
			array(
				'label' => esc_html__( 'Background', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->start_controls_tabs( '_tabs_background' );

		$this->start_controls_tab(
			'_tab_background_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => '_background',
				'selector' => static::WRAPPER_SELECTOR_CHILD,
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'_tab_background_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => '_background_hover',
				'selector' => static::WRAPPER_SELECTOR_HOVER,
			)
		);

		$this->add_control(
			'_background_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'render_type' => 'ui',
				'separator' => 'before',
				'selectors' => array(
					static::WRAPPER_SELECTOR_CHILD => 'transition: background {{SIZE}}s',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register the Border section.
	 *
	 * @return void
	 */
	private function register_border_section() {
		$this->start_controls_section(
			'_section_border',
			array(
				'label' => esc_html__( 'Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->start_controls_tabs( '_tabs_border' );

		$this->start_controls_tab(
			'_tab_border_normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => '_border',
				'selector' => static::WRAPPER_SELECTOR_CHILD,
			)
		);

		$this->add_responsive_control(
			'_border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					static::WRAPPER_SELECTOR_CHILD => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => '_box_shadow',
				'selector' => static::WRAPPER_SELECTOR_CHILD,
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'_tab_border_hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => '_border_hover',
				'selector' => static::WRAPPER_SELECTOR_HOVER,
			)
		);

		$this->add_responsive_control(
			'_border_radius_hover',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					static::WRAPPER_SELECTOR_HOVER_CHILD => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			array(
				'name' => '_box_shadow_hover',
				'selector' => static::WRAPPER_SELECTOR_HOVER,
			)
		);

		$this->add_control(
			'_border_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'separator' => 'before',
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'selectors' => array(
					static::WRAPPER_SELECTOR => 'transition: background {{_background_hover_transition.SIZE}}s, border {{SIZE}}s, border-radius {{SIZE}}s, box-shadow {{SIZE}}s',
				),
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}


	/**
	 * Register the Mask section.
	 *
	 * @return void
	 */
	private function register_masking_section() {
		$this->start_controls_section(
			'_section_masking',
			array(
				'label' => esc_html__( 'Mask', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			)
		);

		$this->add_control(
			'_mask_switch',
			array(
				'label' => esc_html__( 'Mask', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'On', 'elementor' ),
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'default' => '',
			)
		);

		$this->add_control(
			'_mask_shape',
			array(
				'label' => esc_html__( 'Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => $this->get_shapes(),
				'default' => 'circle',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-image: url( ' . ELEMENTOR_ASSETS_URL . '/mask-shapes/{{VALUE}}.svg );' ),
				'condition' => array(
					'_mask_switch!' => '',
				),
			)
		);

		$this->add_control(
			'_mask_image',
			array(
				'label' => esc_html__( 'Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'media_types' => array( 'image' ),
				'should_include_svg_inline_option' => true,
				'library_type' => 'image/svg+xml',
				'dynamic' => array(
					'active' => true,
				),
				'selectors' => $this->get_mask_selectors( '-webkit-mask-image: url( {{URL}} );' ),
				'condition' => array(
					'_mask_switch!' => '',
					'_mask_shape' => 'custom',
				),
			)
		);

		$this->add_control(
			'_mask_notice',
			array(
				'type' => Controls_Manager::HIDDEN,
				'raw' => esc_html__( 'Need More Shapes?', 'elementor' ) .
						'<br>' .
						sprintf(
							'%1$s <a target="_blank" href="https://go.elementor.com/mask-control">%2$s</a>',
							esc_html__( 'Explore additional Premium Shape packs and use them in your site.', 'elementor' ),
							esc_html__( 'Learn more', 'elementor' ),
						),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
				'condition' => array(
					'_mask_switch!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'contain' => esc_html__( 'Fit', 'elementor' ),
					'cover' => esc_html__( 'Fill', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
				'default' => 'contain',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-size: {{VALUE}};' ),
				'condition' => array(
					'_mask_switch!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_size_scale',
			array(
				'label' => esc_html__( 'Scale', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 500,
					),
					'em' => array(
						'min' => 0,
						'max' => 100,
					),
					'%' => array(
						'min' => 0,
						'max' => 200,
					),
				),
				'default' => array(
					'unit' => '%',
					'size' => 100,
				),
				'selectors' => $this->get_mask_selectors( '-webkit-mask-size: {{SIZE}}{{UNIT}};' ),
				'condition' => array(
					'_mask_switch!' => '',
					'_mask_size' => 'custom',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_position',
			array(
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'center center' => esc_html__( 'Center Center', 'elementor' ),
					'center left' => esc_html__( 'Center Left', 'elementor' ),
					'center right' => esc_html__( 'Center Right', 'elementor' ),
					'top center' => esc_html__( 'Top Center', 'elementor' ),
					'top left' => esc_html__( 'Top Left', 'elementor' ),
					'top right' => esc_html__( 'Top Right', 'elementor' ),
					'bottom center' => esc_html__( 'Bottom Center', 'elementor' ),
					'bottom left' => esc_html__( 'Bottom Left', 'elementor' ),
					'bottom right' => esc_html__( 'Bottom Right', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
				'default' => 'center center',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position: {{VALUE}};' ),
				'condition' => array(
					'_mask_switch!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_position_x',
			array(
				'label' => esc_html__( 'X Position', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'min' => -500,
						'max' => 500,
					),
					'em' => array(
						'min' => -100,
						'max' => 100,
					),
					'%' => array(
						'min' => -100,
						'max' => 100,
					),
					'vw' => array(
						'min' => -100,
						'max' => 100,
					),
				),
				'default' => array(
					'unit' => '%',
					'size' => 0,
				),
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position-x: {{SIZE}}{{UNIT}};' ),
				'condition' => array(
					'_mask_switch!' => '',
					'_mask_position' => 'custom',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_position_y',
			array(
				'label' => esc_html__( 'Y Position', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'min' => -500,
						'max' => 500,
					),
					'em' => array(
						'min' => -100,
						'max' => 100,
					),
					'%' => array(
						'min' => -100,
						'max' => 100,
					),
					'vw' => array(
						'min' => -100,
						'max' => 100,
					),
				),
				'default' => array(
					'unit' => '%',
					'size' => 0,
				),
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position-y: {{SIZE}}{{UNIT}};' ),
				'condition' => array(
					'_mask_switch!' => '',
					'_mask_position' => 'custom',
				),
			)
		);

		$this->add_responsive_control(
			'_mask_repeat',
			array(
				'label' => esc_html__( 'Repeat', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'no-repeat' => esc_html__( 'No-repeat', 'elementor' ),
					'repeat' => esc_html__( 'Repeat', 'elementor' ),
					'repeat-x' => esc_html__( 'Repeat-x', 'elementor' ),
					'repeat-Y' => esc_html__( 'Repeat-y', 'elementor' ),
					'round' => esc_html__( 'Round', 'elementor' ),
					'space' => esc_html__( 'Space', 'elementor' ),
				),
				'default' => 'no-repeat',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-repeat: {{VALUE}};' ),
				'condition' => array(
					'_mask_switch!' => '',
					'_mask_size!' => 'cover',
				),
			)
		);

		$this->end_controls_section();
	}


	/**
	 * Register the Responsive section.
	 *
	 * @return void
	 */
	private function register_responsive_section() {
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
	}

	/**
	 * Register common widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->register_layout_section();

		$this->register_effects_section();

		$this->register_transform_section( '', static::TRANSFORM_SELECTOR_CLASS );

		$this->register_background_section();

		$this->register_border_section();

		$this->register_masking_section();

		$this->register_responsive_section();

		$register_common_controls = apply_filters(
			'elementor/widget/common/register_css_attributes_control',
			true,
			$this
		);

		if ( $register_common_controls ) {
			Plugin::$instance->controls_manager->add_custom_attributes_controls( $this );

			Plugin::$instance->controls_manager->add_custom_css_controls( $this );
		}
	}
}
