<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor divider widget.
 *
 * Elementor widget that displays a line that divides different elements in the
 * page.
 *
 * @since 1.0.0
 */
class Widget_Divider extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve divider widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'divider';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve divider widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return __( 'Divider', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve divider widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-divider';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the divider widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'divider', 'hr', 'line', 'border' ];
	}

	/**
	 * Register divider widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_divider',
			[
				'label' => __( 'Divider', 'elementor' ),
			]
		);

		$this->add_control(
			'style',
			[
				'label' => __( 'Style', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'groups' => [
					[
						'label' => __( 'Classic', 'elementor-pro' ),
						'options' => [
							'solid' => __( 'Solid', 'elementor' ),
							'double' => __( 'Double', 'elementor' ),
							'dotted' => __( 'Dotted', 'elementor' ),
							'dashed' => __( 'Dashed', 'elementor' ),
							'zigzag' => __( 'Zig Zag', 'elementor' ),
							'curly' => __( 'Curly', 'elementor' ),
							'curved' => __( 'Curved', 'elementor' ),
							'wavey' => __( 'Wavey', 'elementor' ),
							'squared' => __( 'Squared', 'elementor' ),
						],
					],
					[
						'label' => __( 'Pattern', 'elementor-pro' ),
						'options' => [
							'hearts' => __( 'Hearts', 'elementor' ),
							'stars' => __( 'Stars', 'elementor' ),
						],
					],
				],
				'render_type' => 'template',
				'default' => 'solid',
				'selectors' => [
					'{{WRAPPER}}' => '--divider-border-style: {{VALUE}}',
				],
			]
		);

		$classic_separator_styles = [
			'solid',
			'double',
			'dotted',
			'dashed',
		];

		$solid_separator_styles = [
			'hearts',
			'stars',
		];

		$this->add_control(
			'separator_type',
			[
				'type' => Controls_Manager::HIDDEN,
				'default' => 'pattern',
				'prefix_class' => 'elementor-widget-divider--separator-type-',
				'condition' => [
					'style!' => $classic_separator_styles,
				],
				'render_type' => 'template',
			]
		);

		$this->add_responsive_control(
			'width',
			[
				'label' => __( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ '%', 'px' ],
				'range' => [
					'px' => [
						'max' => 1000,
					],
				],
				'default' => [
					'size' => 100,
					'unit' => '%',
				],
				'tablet_default' => [
					'unit' => '%',
				],
				'mobile_default' => [
					'unit' => '%',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-divider-separator' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'render_type' => 'template',
				'selectors' => [
					'{{WRAPPER}} .elementor-divider-separator' => 'margin-{{VALUE}}: 0',
				],
			]
		);

		$this->add_control(
			'look',
			[
				'label' => __( 'Add Element', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'line' => [
						'title' => __( 'None', 'elementor-pro' ),
						'icon' => 'eicon-ban',
					],
					'line_text' => [
						'title' => __( 'Text', 'elementor-pro' ),
						'icon' => 'eicon-t-letter-bold',
					],
					'line_icon' => [
						'title' => __( 'Icon', 'elementor-pro' ),
						'icon' => 'eicon-star',
					],
				],
				'separator' => 'before',
				'prefix_class' => 'elementor-widget-divider--view-',
				'render_type' => 'template',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->add_control(
			'text',
			[
				'label' => __( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'condition' => [
					'look' => 'line_text'
				],
				'default' => __( 'Add Your Text Here', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'default' => [
					'value' => 'fas fa-star',
					'library' => 'fa-solid',
				],
				'condition' => [
					'look' => 'line_icon'
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_divider_style',
			[
				'label' => __( 'Divider', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'style!' => 'none',
				],
			]
		);

		$this->add_control(
			'color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'default' => '#000',
				'render_type' => 'template',
				'selectors' => [
					'{{WRAPPER}}' => '--divider-border-color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'weight',
			[
				'label' => __( 'Weight', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1,
				],
				'range' => [
					'px' => [
						'min' => 1,
						'max' => 10,
					],
				],
				'render_type' => 'template',
				'conditions!' => [
					'style!' => $solid_separator_styles,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-border-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'pattern_height',
			[
				'label' => __( 'Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}}' => '--divider-pattern-height: {{SIZE}}{{UNIT}}',
				],
				'default' => [
					'size' => 20,
				],
				'condition' => [
					'separator_type' => 'pattern'
				],
			]
		);

		$this->add_control(
			'pattern_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ '%', 'px' ],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-pattern-size: {{SIZE}}{{UNIT}}'
				],
				'default' => [
					'size' => 20,
				],
				'condition' => [
					'separator_type' => 'pattern'
				],
			]
		);

		$this->add_responsive_control(
			'gap',
			[
				'label' => __( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 15,
				],
				'range' => [
					'px' => [
						'min' => 2,
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-divider' => 'padding-top: {{SIZE}}{{UNIT}}; padding-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'animation',
			[
				'label' => __( 'Animation', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'None', 'elementor' ),
					'moveBgRight' => __( 'Right', 'elementor' ),
					'moveBgLeft' => __( 'Left', 'elementor' ),
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--divider-pattern-animation: {{VALUE}}',
				],
				'separator' => 'before',
				'condition' => [
					'separator_type' => 'pattern'
				],
			]
		);

		$this->add_control(
			'animation_speed',
			[
				'label' => __( 'Speed', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 10,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-pattern-animation-speed: {{SIZE}}s',
				],
				'condition' => [
					'animation!' => '',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_text_style',
			[
				'label' => __( 'Text', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'look' => 'line_text'
				],
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-divider__text' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'selector' => '{{WRAPPER}} .elementor-divider__text',
			]
		);

		$this->add_responsive_control(
			'text_align',
			[
				'label' => __( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'default' => 'center',
				'prefix_class' => 'elementor-widget-divider--element-align-'
			]
		);

		$this->add_responsive_control(
			'text_spacing',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-element-spacing: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_style',
			[
				'label' => __( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'look' => 'line_icon'
				],
			]
		);

		$this->add_control(
			'icon_view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'stacked' => __( 'Stacked', 'elementor' ),
					'framed' => __( 'Framed', 'elementor' ),
				],
				'default' => 'default',
				'prefix_class' => 'elementor-view-',
			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 6,
						'max' => 300,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-icon-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'range' => [
					'em' => [
						'min' => 0,
						'max' => 5,
					],
				],
				'condition' => [
					'icon_view!' => 'default',
				],
			]
		);

		$this->add_control(
			'primary_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-framed .elementor-icon, {{WRAPPER}}.elementor-view-default .elementor-icon' => 'color: {{VALUE}}; border-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-framed .elementor-icon, {{WRAPPER}}.elementor-view-default .elementor-icon svg' => 'fill: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
			]
		);

		$this->add_control(
			'secondary_color',
			[
				'label' => __( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'condition' => [
					'icon_view!' => 'default',
				],
				'selectors' => [
					'{{WRAPPER}}.elementor-view-framed .elementor-icon' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon' => 'color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon svg' => 'fill: {{VALUE}};',
				],
			]
		);

		$this->add_responsive_control(
			'icon_align',
			[
				'label' => __( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'default' => 'center',
				'prefix_class' => 'elementor-widget-divider--element-align-'
			]
		);

		$this->add_responsive_control(
			'icon_spacing',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--divider-element-spacing: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'rotate',
			[
				'label' => __( 'Rotate', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'deg' ],
				'default' => [
					'size' => 0,
					'unit' => 'deg',
				],
				'tablet_default' => [
					'unit' => 'deg',
				],
				'mobile_default' => [
					'unit' => 'deg',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon i, {{WRAPPER}} .elementor-icon svg' => 'transform: rotate({{SIZE}}{{UNIT}})',
				],
			]
		);

		$this->add_control(
			'icon_border_width',
			[
				'label' => __( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'border-width: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'icon_view' => 'framed',
				],
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'border-radius: {{SIZE}}{{UNIT}}',
				],
				'condition' => [
					'icon_view!' => 'default',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Build SVG
	 *
	 * Build SVG element markup based on the widgets settings.
	 *
	 * @param bool $is_end used to build the second SVG in case there is an icon or text element. Default false.
	 * @return string - An SVG element.
	 *
	 * @since  2.7.0
	 * @access private
	 */
	private function build_svg() {
		$settings = $this->get_settings_for_display();

		if ( 'pattern' != $settings['separator_type'] ) {
			return '';
		}

		$svg_shapes = [
			'zigzag'  => [
				'shape' => '<polyline points="0,18 12,6 24,18 "/>',
				'preserve_aspect_ratio' => false,
			],
			'wavey'   => [
				'shape' => '<path d="M0,6c6,0,0.9,11.1,6.9,11.1S18,6,24,6"/>',
				'preserve_aspect_ratio' => false,
			],
			'curved'   => [
				'shape' => '<path d="M0,6c6,0,6,13,12,13S18,6,24,6"/>',
				'preserve_aspect_ratio' => false,
			],
			'squared' => [
				'shape' => '<polyline points="0,6 6,6 6,18 18,18 18,6 24,6 	"/>',
				'preserve_aspect_ratio' => false,
			],
			'curly'   => [
				'shape' => '<path d="M0,21c3.3,0,8.3-0.9,15.7-7.1c6.6-5.4,4.4-9.3,2.4-10.3c-3.4-1.8-7.7,1.3-7.3,8.8C11.2,20,17.1,21,24,21"/>',
				'preserve_aspect_ratio' => false,
			],
			'hearts'  => [
				'shape' => '<path d="M20.9,4.3c-2.4-2-5.9-1.6-8,0.6L12,5.8l-0.8-0.9C9,2.7,5.5,2.3,3.1,4.3c-2.7,2.3-2.8,6.4-0.4,8.9l8.3,8.6c0.5,0.6,1.4,0.6,1.9,0l8.3-8.6C23.7,10.8,23.6,6.6,20.9,4.3z"/>',
				'preserve_aspect_ratio' => true,
			],
			'stars'   => [
				'shape' => '<path d="M10.8,1.7L8.1,7.1l-6,0.9C1,8.1,0.6,9.4,1.4,10.1l4.3,4.1l-1,5.9c-0.2,1.1,1,1.9,1.9,1.4l5.4-2.8l5.4,2.8c1,0.5,2.1-0.3,1.9-1.4l-1-5.9l4.3-4.1c0.8-0.7,0.3-2-0.7-2.2l-6-0.9l-2.7-5.3C12.7,0.8,11.3,0.8,10.8,1.7z"/>',
				'preserve_aspect_ratio' => true,
			],
		];

		$selected_pattern = $svg_shapes[ $settings['style'] ];
		$preserve_aspect_ratio = $selected_pattern['preserve_aspect_ratio'] ? 'xMidYMid meet' : 'none';
		$view_box = isset( $selected_pattern['view_box'] ) ? $selected_pattern['view_box'] : '0 0 24 24';

		$attr = [
			'preserveAspectRatio' => $preserve_aspect_ratio,
			'overflow' => 'visible',
			'height' => '100%',
			'viewBox' => $view_box,
		];

		if ( $selected_pattern['preserve_aspect_ratio'] ) {
			$attr['fill'] = $settings['color'];
			$attr['stroke'] = 'none';
		} else {
			$attr['stroke'] = $settings['color'];
			$attr['stroke-width'] = $settings['weight']['size'];
			$attr['fill'] = 'none';
			$attr['stroke-linecap'] = 'square';
			$attr['stroke-miterlimit'] = '10';
		}

		$this->add_render_attribute( 'svg', $attr );

		$pattern_attribute_string = $this->get_render_attribute_string( 'svg' );
		$shape = $selected_pattern['shape'];

		return '<svg xmlns="http://www.w3.org/2000/svg" ' . $pattern_attribute_string . '>' . $shape . '</svg>';
	}

	public function svg_to_data_uri( $svg  ) {
		return str_replace(
			[ '<', '>', '"', '#' ],
			[ '%3C', '%3E', "'", '%23' ],
			$svg
		);
	}

	/**
	 * Render divider widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$svg_code = $this->build_svg();
		$has_icon = 'line_icon' === ( $settings[ 'look' ] ) && ! empty( $settings[ 'icon' ] );
		$has_text = 'line_text' === ( $settings[ 'look' ] ) && ! empty( $settings[ 'text' ] );
		$has_element = $has_icon || $has_text;
		?>
		<div class="elementor-divider">
			<?php if ( ! empty( $svg_code ) ) { ?>
			<style>
				.elementor-element-<?php echo $this->get_id(); ?> {
					--divider-pattern-url: url("data:image/svg+xml,<?php echo $this->svg_to_data_uri( $svg_code ) ?>");
				}
			</style>
			<?php } ?>
			<span class="elementor-divider-separator">
			<?php if ( $has_icon ) { ?>
				<div class="elementor-icon elementor-divider__element"><?php Icons_Manager::render_icon( $settings[ 'icon' ], [ 'aria-hidden' => 'true' ] ); ?></div>
			<?php } elseif ( $has_text )  {
				$this->add_inline_editing_attributes( 'text' );
				$this->add_render_attribute( 'text', [ 'class' => [ 'elementor-divider__text', 'elementor-divider__element' ] ] );
				?>
				<span <?php echo $this->get_render_attribute_string( 'text' ); ?>><?php echo $settings[ 'text' ]; ?></span>
			<?php } ?>
			</span>
		</div>
		<?php
	}

	/**
	 * Render divider widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
}
