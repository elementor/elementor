<?php
namespace Elementor;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;

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
class Widget_Common extends Widget_Base {

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
		return 'common';
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
	 * @access protected
	 *
	 * @param array $args arguments to duplicate per breakpoint
	 * @param array $devices_to_exclude
	 *
	 * @return array responsive device args
	 */
	protected function get_responsive_device_args( array $args, array $devices_to_exclude = [] ) {
		$device_args = [];
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
		$parsed_args = [];

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
		$shapes = [
			'circle' => esc_html__( 'Circle', 'elementor' ),
			'flower' => esc_html__( 'Flower', 'elementor' ),
			'sketch' => esc_html__( 'Sketch', 'elementor' ),
			'triangle' => esc_html__( 'Triangle', 'elementor' ),
			'blob' => esc_html__( 'Blob', 'elementor' ),
			'hexagon' => esc_html__( 'Hexagon', 'elementor' ),
		];

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
		$mask_selectors = [
			'default' => '{{WRAPPER}}:not( .elementor-widget-image ) .elementor-widget-container',
			'image' => '{{WRAPPER}}.elementor-widget-image .elementor-widget-container img',
		];

		return [
			$mask_selectors['default'] => $rules,
			$mask_selectors['image'] => $rules,
		];
	}

	/**
	 * Register the Layout section.
	 *
	 * @return void
	 */
	private function register_layout_section() {
		$this->start_controls_section(
			'_section_style',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		// Element Name for the Navigator
		$this->add_control(
			'_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'render_type' => 'none',
			]
		);

		$this->add_responsive_control(
			'_margin',
			[
				'label' => esc_html__( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%', 'rem' ],
				'selectors' => [
					'{{WRAPPER}} > .elementor-widget-container' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%', 'rem' ],
				'selectors' => [
					'{{WRAPPER}} > .elementor-widget-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$experiments_manager = Plugin::$instance->experiments;
		$is_container_active = $experiments_manager->is_feature_active( 'container' );

		$this->add_responsive_control(
			'_element_width',
			[
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
					'inherit' => esc_html__( 'Full Width', 'elementor' ) . ' (100%)',
					'auto' => esc_html__( 'Inline', 'elementor' ) . ' (auto)',
					'initial' => esc_html__( 'Custom', 'elementor' ),
				],
				'selectors_dictionary' => [
					'inherit' => '100%',
				],
				'prefix_class' => 'elementor-widget%s__width-',
				'selectors' => [
					'{{WRAPPER}}' => 'width: {{VALUE}}; max-width: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'_element_custom_width',
			[
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'unit' => '%',
				],
				'range' => [
					'px' => [
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'max' => 100,
						'step' => 1,
					],
				],
				'size_units' => [ 'px', '%', 'vw' ],
				'selectors' => [
					'{{WRAPPER}}' => 'width: {{SIZE}}{{UNIT}}; max-width: {{SIZE}}{{UNIT}}',
				],
				'condition' => [ '_element_width' => 'initial' ],
				'device_args' => $this->get_responsive_device_args( [
					'condition' => [
						'_element_width_{{DEVICE}}' => [ 'initial' ],
					],
				] ),
			]
		);

		// Register Flex controls only if the Container experiment is active.
		if ( $is_container_active ) {
			$this->add_group_control(
				Group_Control_Flex_Item::get_type(),
				[
					'name' => '_flex',
					// Hack to increase specificity and make sure that the current widget overrides the
					// parent flex settings.
					'selector' => '{{WRAPPER}}.elementor-element',
					'include' => [
						'align_self',
						'order',
						'order_custom',
						'size',
						'grow',
						'shrink',
					],
					'fields_options' => [
						'align_self' => [
							'separator' => 'before',
						],
					],
				]
			);
		}

		$vertical_align_conditions = [
			'_element_width!' => '',
			'_position' => '',
		];

		if ( $is_container_active ) {
			$vertical_align_conditions['_element_vertical_align!'] = ''; // TODO: For BC.
		}

		// TODO: For BC - Remove in the future.
		$this->add_responsive_control(
			'_element_vertical_align',
			[
				'label' => esc_html__( 'Vertical Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'flex-start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					],
					'flex-end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'condition' => $vertical_align_conditions,
				'selectors' => [
					'{{WRAPPER}}' => 'align-self: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'_position_description',
			[
				'raw' => '<strong>' . esc_html__( 'Please note!', 'elementor' ) . '</strong> ' . esc_html__( 'Custom positioning is not considered best practice for responsive web design and should not be used too frequently.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-warning',
				'render_type' => 'ui',
				'condition' => [
					'_position!' => '',
				],
			]
		);

		$this->add_control(
			'_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default', 'elementor' ),
					'absolute' => esc_html__( 'Absolute', 'elementor' ),
					'fixed' => esc_html__( 'Fixed', 'elementor' ),
				],
				'prefix_class' => 'elementor-',
				'frontend_available' => true,
				'separator' => 'before',
			]
		);

		$start = is_rtl() ? esc_html__( 'Right', 'elementor' ) : esc_html__( 'Left', 'elementor' );
		$end = ! is_rtl() ? esc_html__( 'Right', 'elementor' ) : esc_html__( 'Left', 'elementor' );

		$this->add_control(
			'_offset_orientation_h',
			[
				'label' => esc_html__( 'Horizontal Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => [
					'start' => [
						'title' => $start,
						'icon' => 'eicon-h-align-left',
					],
					'end' => [
						'title' => $end,
						'icon' => 'eicon-h-align-right',
					],
				],
				'classes' => 'elementor-control-start-end',
				'render_type' => 'ui',
				'condition' => [
					'_position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_x',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
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
				'default' => [
					'size' => '0',
				],
				'size_units' => [ 'px', '%', 'vw', 'vh' ],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_h!' => 'end',
					'_position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_x_end',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 0.1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
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
				'default' => [
					'size' => '0',
				],
				'size_units' => [ 'px', '%', 'vw', 'vh' ],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}' => 'right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}' => 'left: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_h' => 'end',
					'_position!' => '',
				],
			]
		);

		$this->add_control(
			'_offset_orientation_v',
			[
				'label' => esc_html__( 'Vertical Orientation', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'toggle' => false,
				'default' => 'start',
				'options' => [
					'start' => [
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'end' => [
						'title' => esc_html__( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'render_type' => 'ui',
				'condition' => [
					'_position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_y',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'size_units' => [ 'px', '%', 'vh', 'vw' ],
				'default' => [
					'size' => '0',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'top: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_v!' => 'end',
					'_position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_offset_y_end',
			[
				'label' => esc_html__( 'Offset', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => -1000,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => -200,
						'max' => 200,
					],
					'vh' => [
						'min' => -200,
						'max' => 200,
					],
					'vw' => [
						'min' => -200,
						'max' => 200,
					],
				],
				'size_units' => [ 'px', '%', 'vh', 'vw' ],
				'default' => [
					'size' => '0',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'bottom: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'_offset_orientation_v' => 'end',
					'_position!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_z_index',
			[
				'label' => esc_html__( 'Z-Index', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'selectors' => [
					'{{WRAPPER}}' => 'z-index: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'_element_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'default' => '',
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
				'classes' => 'elementor-control-direction-ltr',
			]
		);

		$this->add_control(
			'_css_classes',
			[
				'label' => esc_html__( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'prefix_class' => '',
				'title' => esc_html__( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
				'classes' => 'elementor-control-direction-ltr',
			]
		);

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
			[
				'label' => esc_html__( 'Motion Effects', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_responsive_control(
			'_animation',
			[
				'label' => esc_html__( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'animation_duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => esc_html__( 'Slow', 'elementor' ),
					'' => esc_html__( 'Normal', 'elementor' ),
					'fast' => esc_html__( 'Fast', 'elementor' ),
				],
				'prefix_class' => 'animated-',
				'condition' => [
					'_animation!' => '',
				],
			]
		);

		$this->add_control(
			'_animation_delay',
			[
				'label' => esc_html__( 'Animation Delay', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => '',
				'min' => 0,
				'step' => 100,
				'condition' => [
					'_animation!' => '',
				],
				'render_type' => 'none',
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();
	}

	private function register_transform_section() {
		$this->start_controls_section(
			'_section_transform',
			[
				'label' => esc_html__( 'Transform', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->start_controls_tabs( '_tabs_positioning' );

		$transform_prefix_class = 'e-';
		$transform_return_value = 'transform';

		foreach ( [ '', '_hover' ] as $tab ) {
			$state = '_hover' === $tab ? ':hover' : '';

			$this->start_controls_tab(
				"_tab_positioning{$tab}",
				[
					'label' => '' === $tab ? esc_html__( 'Normal', 'elementor' ) : esc_html__( 'Hover', 'elementor' ),
				]
			);

			$this->add_control(
				"_transform_rotate_popover{$tab}",
				[
					'label' => esc_html__( 'Rotate', 'elementor' ),
					'type' => Controls_Manager::POPOVER_TOGGLE,
					'prefix_class' => $transform_prefix_class,
					'return_value' => $transform_return_value,
				]
			);

			$this->start_popover();

			$this->add_responsive_control(
				"_transform_rotateZ_effect{$tab}",
				[
					'label' => esc_html__( 'Rotate', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => -360,
							'max' => 360,
						],
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-rotateZ: {{SIZE}}deg',
					],
					'condition' => [
						"_transform_rotate_popover{$tab}!" => '',
					],
					'frontend_available' => true,
				]
			);

			$this->add_control(
				"_transform_rotate_3d{$tab}",
				[
					'label' => esc_html__( '3D Rotate', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'label_on' => esc_html__( 'On', 'elementor' ),
					'label_off' => esc_html__( 'Off', 'elementor' ),
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-rotateX: 1deg;  --e-transform-perspective: 20px;',
					],
					'condition' => [
						"_transform_rotate_popover{$tab}!" => '',
					],
				]
			);

			$this->add_responsive_control(
				"_transform_rotateX_effect{$tab}",
				[
					'label' => esc_html__( 'Rotate X', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => -360,
							'max' => 360,
						],
					],
					'condition' => [
						"_transform_rotate_3d{$tab}!" => '',
						"_transform_rotate_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-rotateX: {{SIZE}}deg;',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_rotateY_effect{$tab}",
				[
					'label' => esc_html__( 'Rotate Y', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => -360,
							'max' => 360,
						],
					],
					'condition' => [
						"_transform_rotate_3d{$tab}!" => '',
						"_transform_rotate_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-rotateY: {{SIZE}}deg;',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_perspective_effect{$tab}",
				[
					'label' => esc_html__( 'Perspective', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => 0,
							'max' => 1000,
						],
					],
					'condition' => [
						"_transform_rotate_popover{$tab}!" => '',
						"_transform_rotate_3d{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-perspective: {{SIZE}}px',
					],
					'frontend_available' => true,
				]
			);

			$this->end_popover();

			$this->add_control(
				"_transform_translate_popover{$tab}",
				[
					'label' => esc_html__( 'Offset', 'elementor' ),
					'type' => Controls_Manager::POPOVER_TOGGLE,
					'prefix_class' => $transform_prefix_class,
					'return_value' => $transform_return_value,
				]
			);

			$this->start_popover();

			$this->add_responsive_control(
				"_transform_translateX_effect{$tab}",
				[
					'label' => esc_html__( 'Offset X', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'size_units' => [ '%', 'px' ],
					'range' => [
						'%' => [
							'min' => -100,
							'max' => 100,
						],
						'px' => [
							'min' => -1000,
							'max' => 1000,
						],
					],
					'condition' => [
						"_transform_translate_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-translateX: {{SIZE}}{{UNIT}};',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_translateY_effect{$tab}",
				[
					'label' => esc_html__( 'Offset Y', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'size_units' => [ '%', 'px' ],
					'range' => [
						'%' => [
							'min' => -100,
							'max' => 100,
						],
						'px' => [
							'min' => -1000,
							'max' => 1000,
						],
					],
					'condition' => [
						"_transform_translate_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-translateY: {{SIZE}}{{UNIT}};',
					],
					'frontend_available' => true,
				]
			);

			$this->end_popover();

			$this->add_control(
				"_transform_scale_popover{$tab}",
				[
					'label' => esc_html__( 'Scale', 'elementor' ),
					'type' => Controls_Manager::POPOVER_TOGGLE,
					'prefix_class' => $transform_prefix_class,
					'return_value' => $transform_return_value,
				]
			);

			$this->start_popover();

			$this->add_control(
				"_transform_keep_proportions{$tab}",
				[
					'label' => esc_html__( 'Keep Proportions', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'label_on' => esc_html__( 'On', 'elementor' ),
					'label_off' => esc_html__( 'Off', 'elementor' ),
					'default' => 'yes',
				]
			);

			$this->add_responsive_control(
				"_transform_scale_effect{$tab}",
				[
					'label' => esc_html__( 'Scale', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => 0,
							'max' => 2,
							'step' => 0.1,
						],
					],
					'condition' => [
						"_transform_scale_popover{$tab}!" => '',
						"_transform_keep_proportions{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-scale: {{SIZE}};',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_scaleX_effect{$tab}",
				[
					'label' => esc_html__( 'Scale X', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => 0,
							'max' => 2,
							'step' => 0.1,
						],
					],
					'condition' => [
						"_transform_scale_popover{$tab}!" => '',
						"_transform_keep_proportions{$tab}" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-scaleX: {{SIZE}};',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_scaleY_effect{$tab}",
				[
					'label' => esc_html__( 'Scale Y', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => 0,
							'max' => 2,
							'step' => 0.1,
						],
					],
					'condition' => [
						"_transform_scale_popover{$tab}!" => '',
						"_transform_keep_proportions{$tab}" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-scaleY: {{SIZE}};',
					],
					'frontend_available' => true,
				]
			);

			$this->end_popover();

			$this->add_control(
				"_transform_skew_popover{$tab}",
				[
					'label' => esc_html__( 'Skew', 'elementor' ),
					'type' => Controls_Manager::POPOVER_TOGGLE,
					'prefix_class' => $transform_prefix_class,
					'return_value' => $transform_return_value,
				]
			);

			$this->start_popover();

			$this->add_responsive_control(
				"_transform_skewX_effect{$tab}",
				[
					'label' => esc_html__( 'Skew X', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => -360,
							'max' => 360,
						],
					],
					'condition' => [
						"_transform_skew_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-skewX: {{SIZE}}deg;',
					],
					'frontend_available' => true,
				]
			);

			$this->add_responsive_control(
				"_transform_skewY_effect{$tab}",
				[
					'label' => esc_html__( 'Skew Y', 'elementor' ),
					'type' => Controls_Manager::SLIDER,
					'range' => [
						'px' => [
							'min' => -360,
							'max' => 360,
						],
					],
					'condition' => [
						"_transform_skew_popover{$tab}!" => '',
					],
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-skewY: {{SIZE}}deg;',
					],
					'frontend_available' => true,
				]
			);

			$this->end_popover();

			$this->add_control(
				"_transform_flipX_effect{$tab}",
				[
					'label' => esc_html__( 'Flip Horizontal', 'elementor' ),
					'type' => Controls_Manager::CHOOSE,
					'options' => [
						'transform' => [
							'title' => esc_html__( 'Flip Horizontal', 'elementor' ),
							'icon' => 'eicon-flip eicon-tilted',
						],
					],
					'prefix_class' => $transform_prefix_class,
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-flipX: -1',
					],
					'frontend_available' => true,
				]
			);

			$this->add_control(
				"_transform_flipY_effect{$tab}",
				[
					'label' => esc_html__( 'Flip Vertical', 'elementor' ),
					'type' => Controls_Manager::CHOOSE,
					'options' => [
						'transform' => [
							'title' => esc_html__( 'Flip Vertical', 'elementor' ),
							'icon' => 'eicon-flip',
						],
					],
					'prefix_class' => $transform_prefix_class,
					'selectors' => [
						"{{WRAPPER}} > .elementor-widget-container{$state}" => '--e-transform-flipY: -1',
					],
					'frontend_available' => true,
				]
			);

			if ( '_hover' === $tab ) {
				$this->add_control(
					'_transform_transition_hover',
					[
						'label' => esc_html__( 'Transition Duration (ms)', 'elementor' ),
						'type' => Controls_Manager::SLIDER,
						'range' => [
							'px' => [
								'min' => 100,
								'max' => 10000,
							],
						],
						'selectors' => [
							'{{WRAPPER}} > .elementor-widget-container' => '--e-transform-transition-duration: {{SIZE}}ms',
						],
					]
				);
			}

			${"transform_origin_conditions{$tab}"} = [
				[
					'name' => "_transform_scale_popover{$tab}",
					'operator' => '!=',
					'value' => '',
				],
				[
					'name' => "_transform_rotate_popover{$tab}",
					'operator' => '!=',
					'value' => '',
				],
				[
					'name' => "_transform_flipX_effect{$tab}",
					'operator' => '!=',
					'value' => '',
				],
				[
					'name' => "_transform_flipY_effect{$tab}",
					'operator' => '!=',
					'value' => '',
				],
			];

			$this->end_controls_tab();
		}

		$this->end_controls_tabs();

		$transform_origin_conditions = [
			'relation' => 'or',
			'terms' => array_merge( $transform_origin_conditions, $transform_origin_conditions_hover ),
		];

		// Will override motion effect transform-origin
		$this->add_responsive_control(
			'motion_fx_transform_x_anchor_point',
			[
				'label' => esc_html__( 'X Anchor Point', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'conditions' => $transform_origin_conditions,
				'separator' => 'before',
				'selectors' => [
					'{{WRAPPER}}' => '--e-transform-origin-x: {{VALUE}}',
				],
			]
		);

		// Will override motion effect transform-origin
		$this->add_responsive_control(
			'motion_fx_transform_y_anchor_point',
			[
				'label' => esc_html__( 'Y Anchor Point', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'top' => [
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					],
					'bottom' => [
						'title' => esc_html__( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'conditions' => $transform_origin_conditions,
				'selectors' => [
					'{{WRAPPER}}' => '--e-transform-origin-y: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register the Background section.
	 *
	 * @return void
	 */
	private function register_background_section() {
		$this->start_controls_section(
			'_section_background',
			[
				'label' => esc_html__( 'Background', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->start_controls_tabs( '_tabs_background' );

		$this->start_controls_tab(
			'_tab_background_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => '_background',
				'selector' => '{{WRAPPER}} > .elementor-widget-container',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'_tab_background_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => '_background_hover',
				'selector' => '{{WRAPPER}}:hover .elementor-widget-container',
			]
		);

		$this->add_control(
			'_background_hover_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'render_type' => 'ui',
				'separator' => 'before',
				'selectors' => [
					'{{WRAPPER}} > .elementor-widget-container' => 'transition: background {{SIZE}}s',
				],
			]
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
			[
				'label' => esc_html__( 'Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->start_controls_tabs( '_tabs_border' );

		$this->start_controls_tab(
			'_tab_border_normal',
			[
				'label' => esc_html__( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => '_border',
				'selector' => '{{WRAPPER}} > .elementor-widget-container',
			]
		);

		$this->add_responsive_control(
			'_border_radius',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} > .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => '_box_shadow',
				'selector' => '{{WRAPPER}} > .elementor-widget-container',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'_tab_border_hover',
			[
				'label' => esc_html__( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => '_border_hover',
				'selector' => '{{WRAPPER}}:hover .elementor-widget-container',
			]
		);

		$this->add_responsive_control(
			'_border_radius_hover',
			[
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}}:hover > .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => '_box_shadow_hover',
				'selector' => '{{WRAPPER}}:hover .elementor-widget-container',
			]
		);

		$this->add_control(
			'_border_hover_transition',
			[
				'label' => esc_html__( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'separator' => 'before',
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'transition: background {{_background_hover_transition.SIZE}}s, border {{SIZE}}s, border-radius {{SIZE}}s, box-shadow {{SIZE}}s',
				],
			]
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
			[
				'label' => esc_html__( 'Mask', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'_mask_switch',
			[
				'label' => esc_html__( 'Mask', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'On', 'elementor' ),
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'default' => '',
			]
		);

		$this->add_control(
			'_mask_shape',
			[
				'label' => esc_html__( 'Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => $this->get_shapes(),
				'default' => 'circle',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-image: url( ' . ELEMENTOR_ASSETS_URL . '/mask-shapes/{{VALUE}}.svg );' ),
				'condition' => [
					'_mask_switch!' => '',
				],
			]
		);

		$this->add_control(
			'_mask_image',
			[
				'label' => esc_html__( 'Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'media_type' => 'image',
				'should_include_svg_inline_option' => true,
				'library_type' => 'image/svg+xml',
				'dynamic' => [
					'active' => true,
				],
				'selectors' => $this->get_mask_selectors( '-webkit-mask-image: url( {{URL}} );' ),
				'condition' => [
					'_mask_switch!' => '',
					'_mask_shape' => 'custom',
				],
			]
		);

		$this->add_control(
			'_mask_notice',
			[
				'type' => Controls_Manager::HIDDEN,
				'raw' => esc_html__( 'Need More Shapes?', 'elementor' ) .
						'<br>' .
						sprintf(
							/* translators: 1: Link open tag, 2: Link close tag. */
							esc_html__( 'Explore additional Premium Shape packs and use them in your site. %1$sLearn More%2$s', 'elementor' ),
							'<a target="_blank" href="https://go.elementor.com/mask-control">',
							'</a>'
						),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
				'condition' => [
					'_mask_switch!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'contain' => esc_html__( 'Fit', 'elementor' ),
					'cover' => esc_html__( 'Fill', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
				'default' => 'contain',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-size: {{VALUE}};' ),
				'condition' => [
					'_mask_switch!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_size_scale',
			[
				'label' => esc_html__( 'Scale', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', '%', 'vw' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 500,
					],
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'%' => [
						'min' => 0,
						'max' => 200,
					],
					'vw' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 100,
				],
				'selectors' => $this->get_mask_selectors( '-webkit-mask-size: {{SIZE}}{{UNIT}};' ),
				'condition' => [
					'_mask_switch!' => '',
					'_mask_size' => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
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
				],
				'default' => 'center center',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position: {{VALUE}};' ),
				'condition' => [
					'_mask_switch!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_position_x',
			[
				'label' => esc_html__( 'X Position', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', '%', 'vw' ],
				'range' => [
					'px' => [
						'min' => -500,
						'max' => 500,
					],
					'em' => [
						'min' => -100,
						'max' => 100,
					],
					'%' => [
						'min' => -100,
						'max' => 100,
					],
					'vw' => [
						'min' => -100,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 0,
				],
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position-x: {{SIZE}}{{UNIT}};' ),
				'condition' => [
					'_mask_switch!' => '',
					'_mask_position' => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_position_y',
			[
				'label' => esc_html__( 'Y Position', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', '%', 'vw' ],
				'range' => [
					'px' => [
						'min' => -500,
						'max' => 500,
					],
					'em' => [
						'min' => -100,
						'max' => 100,
					],
					'%' => [
						'min' => -100,
						'max' => 100,
					],
					'vw' => [
						'min' => -100,
						'max' => 100,
					],
				],
				'default' => [
					'unit' => '%',
					'size' => 0,
				],
				'selectors' => $this->get_mask_selectors( '-webkit-mask-position-y: {{SIZE}}{{UNIT}};' ),
				'condition' => [
					'_mask_switch!' => '',
					'_mask_position' => 'custom',
				],
			]
		);

		$this->add_responsive_control(
			'_mask_repeat',
			[
				'label' => esc_html__( 'Repeat', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'no-repeat' => esc_html__( 'No-Repeat', 'elementor' ),
					'repeat' => esc_html__( 'Repeat', 'elementor' ),
					'repeat-x' => esc_html__( 'Repeat-X', 'elementor' ),
					'repeat-Y' => esc_html__( 'Repeat-Y', 'elementor' ),
					'round' => esc_html__( 'Round', 'elementor' ),
					'space' => esc_html__( 'Space', 'elementor' ),
				],
				'default' => 'no-repeat',
				'selectors' => $this->get_mask_selectors( '-webkit-mask-repeat: {{VALUE}};' ),
				'condition' => [
					'_mask_switch!' => '',
					'_mask_size!' => 'cover',
				],
			]
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
			[
				'label' => esc_html__( 'Responsive', 'elementor' ),
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'responsive_description',
			[
				'raw' => esc_html__( 'Responsive visibility will take effect only on preview or live page, and not while editing in Elementor.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'content_classes' => 'elementor-descriptor',
			]
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

		$this->register_transform_section();

		$this->register_background_section();

		$this->register_border_section();

		$this->register_masking_section();

		$this->register_responsive_section();

		Plugin::$instance->controls_manager->add_custom_attributes_controls( $this );

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}
}
