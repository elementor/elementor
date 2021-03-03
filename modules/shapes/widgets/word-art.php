<?php

namespace Elementor\Modules\Shapes\Widgets;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Group_Control_Typography;
use Elementor\Widget_Base;
use Elementor\Modules\Shapes\Module as Shapes_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor WordArt widget.
 *
 * Elementor widget that displays text along SVG path.
 *
 * @since 1.0.0
 */
class WordArt extends Widget_Base {

	const DEFAULT_PATH_FILL = '#E8178A';

	/**
	 * Get widget name.
	 *
	 * Retrieve WordArt widget name.
	 *
	 * @return string Widget name.
	 * @since  1.0.0
	 * @access public
	 *
	 */
	public function get_name() {
		return 'wordart';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve WordArt widget title.
	 *
	 * @return string Widget title.
	 * @since  1.0.0
	 * @access public
	 *
	 */
	public function get_title() {
		return __( 'WordArt', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve WordArt widget icon.
	 *
	 * @return string Widget icon.
	 * @since  1.0.0
	 * @access public
	 *
	 */
	public function get_icon() {
		return 'eicon-wordart';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the WordArt widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @return array Widget categories.
	 * @since  2.0.0
	 * @access public
	 *
	 */
	public function get_categories() {
		return [ 'basic' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @return array Widget keywords.
	 * @since  2.1.0
	 * @access public
	 *
	 */
	public function get_keywords() {
		return [ 'text', 'curve', 'path', 'wordart', 'word art' ];
	}

	/**
	 * Register content controls under content tab.
	 */
	protected function register_content_tab() {
		$this->start_controls_section( 'section_content_wordart', [
			'label' => __( 'WordArt', 'elementor' ),
			'tab' => Controls_Manager::TAB_CONTENT,
		] );

		$this->add_control( 'text',
			[
				'label' => __( 'Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'default' => __( 'Add Your Text Here', 'elementor' ),
			]
		);

		$this->add_control( 'path', [
			'label' => __( 'Shape Path', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'options' => Shapes_Module::get_paths(),
			'default' => 'circle',
		] );

		$this->add_control( 'custom_path', [
			'label' => __( 'SVG', 'elementor' ),
			'type' => Controls_Manager::MEDIA,
			'condition' => [
				'path' => 'custom',
			],
			'dynamic' => [
				'active' => true,
			],
			'description' => __( 'Add data-path-anchor attribute to your path in order to put the text along it. Otherwise, it will default to the first path element.', 'elementor' ),
		] );

		$this->add_control( 'shape_notice',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'Need More Shapes?', 'elementor' ) . '<br>' . sprintf( __( 'Explore additional Premium Shape packs and use them in your site. <a target="_blank" href="%s">Learn More</a>', 'elementor' ), 'https://go.elementor.com/wordart-more-paths' ),
				'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
			]
		);

		$this->add_control( 'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'label_block' => true,
				'dynamic' => [
					'active' => true,
				],
				'placeholder' => __( 'Paste URL or type', 'elementor' ),
			]
		);

		$this->add_responsive_control( 'alignment',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'left',
				'options' => [
					'start' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'middle' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'end' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--alignment: {{VALUE}}',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control( 'show_path', [
			'label' => __( 'Show Path', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'label_on' => __( 'On', 'elementor' ),
			'label_off' => __( 'Off', 'elementor' ),
			'return_value' => self::DEFAULT_PATH_FILL,
			'separator' => 'before',
			'default' => '',
			'selectors' => [
				'{{WRAPPER}}' => '--path-stroke: {{VALUE}}; --path-fill: transparent;',
			],
		] );

		$this->add_control( 'path_notice',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'Notice! The path will be visible on live preview', 'elementor' ),
				'show_label' => false,
				'content_classes' => 'elementor-descriptor',
				'condition' => [
					'show_path!' => '',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Register style controls under style tab.
	 */
	protected function register_style_tab() {
		/**
		 * WordArt styling section.
		 */
		$this->start_controls_section( 'section_style_wordart', [
			'label' => __( 'WordArt', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
		] );

		$this->add_responsive_control( 'size', [
			'label' => __( 'Size', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ '%', 'px' ],
			'range' => [
				'%' => [
					'min' => 0,
					'max' => 100,
					'step' => 10,
				],
				'px' => [
					'min' => 0,
					'max' => 300,
					'step' => 10,
				],
			],
			'default' => [
				'unit' => '%',
				'size' => 100,
			],
			'selectors' => [
				'{{WRAPPER}}' => '--width: {{SIZE}}{{UNIT}};',
			],
		] );

		$this->add_responsive_control( 'rotation', [
			'label' => __( 'Rotate', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ 'deg' ],
			'range' => [
				'deg' => [
					'min' => 0,
					'max' => 360,
					'step' => 1,
				],
			],
			'default' => [
				'unit' => 'deg',
				'size' => '',
			],
			'selectors' => [
				'{{WRAPPER}}' => '--rotate: {{SIZE}}{{UNIT}};',
			],
		] );

		$this->add_control( 'flip_horizontally', [
			'label' => __( 'Flip Horizontally', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'label_on' => __( 'Yes', 'elementor' ),
			'label_off' => __( 'No', 'elementor' ),
			'return_value' => '-1',
			'default' => '',
			'selectors' => [
				'{{WRAPPER}}' => '--scale-x: {{VALUE}};',
			],
		] );

		$this->add_control( 'flip_vertically', [
			'label' => __( 'Flip Vertically', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'label_on' => __( 'Yes', 'elementor' ),
			'label_off' => __( 'No', 'elementor' ),
			'return_value' => '-1',
			'default' => '',
			'selectors' => [
				'{{WRAPPER}}' => '--scale-y: {{VALUE}};',
			],
		] );

		$this->add_control( 'text_heading', [
			'label' => __( 'Text', 'elementor' ),
			'type' => Controls_Manager::HEADING,
		] );

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'text_typography',
				'selector' => '{{WRAPPER}}',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
			]
		);

		$this->add_responsive_control( 'word_spacing', [
			'label' => __( 'Word Spacing', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ 'px' ],
			'range' => [
				'px' => [
					'min' => -20,
					'max' => 20,
					'step' => 1,
				],
			],
			'default' => [
				'unit' => 'px',
				'size' => '',
			],
			'selectors' => [
				'{{WRAPPER}}' => '--word-spacing: {{SIZE}}{{UNIT}};',
			],
		] );

		$this->add_control( 'start_point', [
			'label' => __( 'Start Point', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ '%' ],
			'range' => [
				'px' => [
					'min' => -100,
					'max' => 100,
					'step' => 1,
				],
			],
			'default' => [
				'unit' => '%',
				'size' => '',
			],
			'frontend_available' => true,
			'render_type' => 'none',
		] );

		$this->start_controls_tabs( 'text_style' );

		/**
		 * Normal tab.
		 */
		$this->start_controls_tab(
			'text_normal',
			[
				'label' => __( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'text_color_normal',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--text-color: {{VALUE}};',
				],
			]
		);

		$this->end_controls_tab();

		/**
		 * Hover tab.
		 */
		$this->start_controls_tab(
			'text_hover',
			[
				'label' => __( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'text_color_hover',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--text-color-hover: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => __( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->add_control(
			'hover_transition',
			[
				'label' => __( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.3,
					'unit' => 's',
				],
				'range' => [
					's' => [
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--transition: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		/**
		 * Path styling section.
		 */
		$this->start_controls_section( 'section_style_path', [
			'label' => __( 'Path', 'elementor' ),
			'tab' => Controls_Manager::TAB_STYLE,
			'condition' => [
				'show_path!' => '',
			],
		] );

		$this->start_controls_tabs( 'path_style' );

		/**
		 * Normal tab.
		 */
		$this->start_controls_tab(
			'path_normal',
			[
				'label' => __( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'path_fill_normal',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--path-fill: {{VALUE}};',
				],
			]
		);

		$this->add_control( 'stroke_heading_normal', [
			'label' => __( 'Stroke', 'elementor' ),
			'type' => Controls_Manager::HEADING,
		] );

		$this->add_control(
			'stroke_color_normal',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => self::DEFAULT_PATH_FILL,
				'selectors' => [
					'{{WRAPPER}}' => '--stroke-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'stroke_width_normal',
			[
				'label' => __( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1,
					'unit' => 'px',
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
						'step' => 1,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--stroke-width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_tab();

		/**
		 * Hover tab.
		 */
		$this->start_controls_tab(
			'path_hover',
			[
				'label' => __( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'path_fill_hover',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--path-fill-hover: {{VALUE}};',
				],
			]
		);

		$this->add_control( 'stroke_heading_hover', [
			'label' => __( 'Stroke', 'elementor' ),
			'type' => Controls_Manager::HEADING,
		] );

		$this->add_control(
			'stroke_color_hover',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => '--stroke-color-hover: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'stroke_width_hover',
			[
				'label' => __( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => '',
					'unit' => 'px',
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
						'step' => 1,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--stroke-width-hover: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'stroke_transition',
			[
				'label' => __( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.3,
					'unit' => 's',
				],
				'range' => [
					's' => [
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--stroke-transition: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	/**
	 * Register WordArt widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since  1.0.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->register_content_tab();
		$this->register_style_tab();
	}

	/**
	 * Render WordArt widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since  1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		// Get the shape SVG markup.
		if ( 'custom' !== $settings['path'] ) {
			$path_svg = Shapes_Module::get_path_svg( $settings['path'] );
		} else {
			$url = $settings['custom_path']['url'];
			// Get the file contents only if it's svg.
			$path_svg = ( 'svg' === pathinfo( $url, PATHINFO_EXTENSION ) ) ? file_get_contents( $url ) : '';
		}

		// Add WordArt text.
		$this->add_render_attribute( 'wordart', [
			'class' => 'elementor-wordart',
			'data-text' => $settings['text'],
		] );

		// Add link attributes.
		if ( ! empty( $settings['link']['url'] ) ) {
			$link = $settings['link'];

			$link_settings = [
				'data-href' => $link['url'],
				'data-target' => $link['is_external'] ? '_blank' : '',
				'data-rel' => $link['nofollow'] ? 'nofollow' : '',
			];

			$this->add_render_attribute( 'wordart', $link_settings );
		}

		// Add hover animation.
		if ( ! empty( $settings['hover_animation'] ) ) {
			$this->add_render_attribute( 'wordart', 'class', 'elementor-animation-' . $settings['hover_animation'] );
		}

		// Handle alignment & start-offset.
		switch ( $settings['alignment'] ) {
			case 'end':
				$offset = '100';
				break;

			case 'middle':
				$offset = '50';
				break;

			case 'start':
			default:
				$offset = '0';
				break;
		}

		// Check if the start point is empty, but accept 0 as value.
		if ( 0 !== strlen( $settings['start_point']['size'] ) ) {
			$offset = $settings['start_point']['size'];
		}

		$this->add_render_attribute( 'wordart', 'data-start-offset', $offset );

		// Render.
		?>
		<div <?php echo $this->get_render_attribute_string( 'wordart' ); ?>>
			<?php echo $path_svg; ?>
		</div>
		<?php
	}
}
