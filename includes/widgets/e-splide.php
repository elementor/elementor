<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor e-heading web component.
 *
 * Elementor web component that displays an eye-catching headlines.
 *
 * @since 3.4.0
 */
class Widget_E_Splide extends Web_Component_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve button widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'e-splide';
	}

	public function get_script_depends() {
		return [ 'ewc-splide' ];
	}

	public function get_title() {
		return __( 'e-Splide', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-slides';
	}

	public function get_categories() {
		return [ 'web-components' ];
	}

	public function get_keywords() {
		return [ 'web-components', 'slides', 'slider', 'carousel', 'slideshow', 'gallery' ];
	}

	/**
	 * Get button sizes.
	 *
	 * Retrieve an array of button sizes for the button widget.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array An array containing button sizes.
	 */
	public static function get_button_sizes() {
		return [
			'tiny' => __( 'Tiny', 'elementor' ),
			'mini' => __( 'Mini', 'elementor' ),
			'small' => __( 'Small', 'elementor' ),
			'medium' => __( 'Medium', 'elementor' ),
			'large' => __( 'Large', 'elementor' ),
			'big' => __( 'Big', 'elementor' ),
			'huge' => __( 'Huge', 'elementor' ),
			'massive' => __( 'Massive', 'elementor' ),
		];
	}

	/**
	 * Get button sizes.
	 *
	 * Retrieve an array of button colors for the button widget.
	 *
	 * @since 3.4.0
	 * @access public
	 * @static
	 *
	 * @return array An array containing button sizes.
	 */
	public static function get_button_colors() {
		return [
			'' => __( 'Default', 'elementor' ),
			'primary' => __( 'Primary', 'elementor' ),
			'secondary' => __( 'Secondary', 'elementor' ),
			'danger' => __( 'Danger', 'elementor' ),
			'success' => __( 'Success', 'elementor' ),
			'warning' => __( 'Warning', 'elementor' ),
			'info' => __( 'Info', 'elementor' ),
			'magenta' => __( 'Magenta', 'elementor' ),
			'fuchsia' => __( 'Fuchsia', 'elementor' ),
			'purple' => __( 'Purple', 'elementor' ),
			'indigo' => __( 'Indigo', 'elementor' ),
			'blue' => __( 'Blue', 'elementor' ),
			'teal' => __( 'Teal', 'elementor' ),
			'green' => __( 'Green', 'elementor' ),
			'celery' => __( 'Celery', 'elementor' ),
			'lime' => __( 'Lime', 'elementor' ),
			'yellow' => __( 'Yellow', 'elementor' ),
			'orange' => __( 'Orange', 'elementor' ),
			'red' => __( 'Red', 'elementor' ),
			'custom' => __( 'Custom', 'elementor' ),
		];
	}

	protected function register_controls() {
		$this->start_controls_section(
			'section_slides',
			[
				'label' => __( 'Slides', 'elementor' ),
			]
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'slides_repeater' );

		$repeater->start_controls_tab( 'background', [ 'label' => __( 'Background', 'elementor' ) ] );

		$repeater->add_control(
			'background_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#bbbbbb',
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-background-color: {{VALUE}}',
				],
			]
		);

		$repeater->add_control(
			'background_image',
			[
				'label' => _x( 'Image', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-background-image: url({{URL}})',
				],
			]
		);

		$repeater->add_control(
			'background_size',
			[
				'label' => _x( 'Size', 'Background Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'cover',
				'options' => [
					'cover' => _x( 'Cover', 'Background Control', 'elementor' ),
					'contain' => _x( 'Contain', 'Background Control', 'elementor' ),
					'auto' => _x( 'Auto', 'Background Control', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-background-size: {{VALUE}}',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_image[url]',
							'operator' => '!=',
							'value' => '',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'background_ken_burns',
			[
				'label' => __( 'Ken Burns Effect', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => '',
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_image[url]',
							'operator' => '!=',
							'value' => '',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'zoom_direction',
			[
				'label' => __( 'Zoom Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'in',
				'options' => [
					'in' => __( 'In', 'elementor' ),
					'out' => __( 'Out', 'elementor' ),
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_ken_burns',
							'operator' => '!=',
							'value' => '',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'background_overlay',
			[
				'label' => __( 'Background Overlay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => '',
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_image[url]',
							'operator' => '!=',
							'value' => '',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'background_overlay_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => 'rgba(0,0,0,0.5)',
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_overlay',
							'value' => 'yes',
						],
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-background-overlay-color: {{VALUE}}',
				],
			]
		);

		$repeater->add_control(
			'background_overlay_blend_mode',
			[
				'label' => __( 'Blend Mode', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'Normal', 'elementor' ),
					'multiply' => 'Multiply',
					'screen' => 'Screen',
					'overlay' => 'Overlay',
					'darken' => 'Darken',
					'lighten' => 'Lighten',
					'color-dodge' => 'Color Dodge',
					'color-burn' => 'Color Burn',
					'hue' => 'Hue',
					'saturation' => 'Saturation',
					'color' => 'Color',
					'exclusion' => 'Exclusion',
					'luminosity' => 'Luminosity',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'background_overlay',
							'value' => 'yes',
						],
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-background-overlay-blend-mode: {{VALUE}}',
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab( 'content', [ 'label' => __( 'Content', 'elementor' ) ] );

		$repeater->add_control(
			'heading',
			[
				'label' => __( 'Title & Description', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'Slide Heading', 'elementor' ),
				'label_block' => true,
				'component_slot' => 'slide-heading',
			]
		);

		$repeater->add_control(
			'description',
			[
				'label' => __( 'Description', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'default' => __( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
				'show_label' => false,
				'component_slot' => 'slide-desc',
			]
		);

		$repeater->add_control(
			'button_text',
			[
				'label' => __( 'Button Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'Click Here', 'elementor' ),
				'component_slot' => 'slide-desc',
			]
		);

		$repeater->add_control(
			'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'https://your-link.com', 'elementor' ),
			]
		);

		$repeater->add_control(
			'link_click',
			[
				'label' => __( 'Apply Link On', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'slide' => __( 'Whole Slide', 'elementor' ),
					'button' => __( 'Button Only', 'elementor' ),
				],
				'default' => 'slide',
				'conditions' => [
					'terms' => [
						[
							'name' => 'link[url]',
							'operator' => '!=',
							'value' => '',
						],
					],
				],
			]
		);

		$repeater->end_controls_tab();


		$repeater->start_controls_tab( 'style', [ 'label' => __( 'Style', 'elementor' ) ] );

		$repeater->add_control(
			'custom_style',
			[
				'label' => __( 'Custom', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'description' => __( 'Set custom style that will only affect this specific slide.', 'elementor' ),
			]
		);

		$repeater->add_control(
			'horizontal_position',
			[
				'label' => __( 'Horizontal Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => __( 'Start', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'end' => [
						'title' => __( 'End', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-content-horizontal-align: {{VALUE}}',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'custom_style',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'vertical_position',
			[
				'label' => __( 'Vertical Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'flex-start' => [
						'title' => __( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					],
					'flex-end' => [
						'title' => __( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--slide-content-vertical-align: {{VALUE}}',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'custom_style',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'text_align',
			[
				'label' => __( 'Text Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => __( 'Start', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'end' => [
						'title' => __( 'End', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => 'text-align: {{VALUE}}',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'custom_style',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$repeater->add_control(
			'content_color',
			[
				'label' => __( 'Content Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => '--content-color: {{VALUE}}',
				],
				'conditions' => [
					'terms' => [
						[
							'name' => 'custom_style',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$repeater->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'repeater_text_shadow',
				'selector' => '{{WRAPPER}} {{CURRENT_ITEM}} .swiper-slide-contents',
				'conditions' => [
					'terms' => [
						[
							'name' => 'custom_style',
							'value' => 'yes',
						],
					],
				],
			]
		);

		$repeater->end_controls_tab();

		$repeater->end_controls_tabs();

		$this->add_control(
			'slides',
			[
				'label' => __( 'Slides', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'show_label' => true,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'heading' => __( 'Slide 1 Heading', 'elementor' ),
						'description' => __( 'Lorem ipsum dolor sit amet consectetur adipiscing elit dolor', 'elementor' ),
						'button_text' => __( 'Click Here', 'elementor' ),
						'background_color' => '#833ca3',
					],
					[
						'heading' => __( 'Slide 2 Heading', 'elementor' ),
						'description' => __( 'Lorem ipsum dolor sit amet consectetur adipiscing elit dolor', 'elementor' ),
						'button_text' => __( 'Click Here', 'elementor' ),
						'background_color' => '#4054b2',
					],
					[
						'heading' => __( 'Slide 3 Heading', 'elementor' ),
						'description' => __( 'Lorem ipsum dolor sit amet consectetur adipiscing elit dolor', 'elementor' ),
						'button_text' => __( 'Click Here', 'elementor' ),
						'background_color' => '#1abc9c',
					],
				],
				'title_field' => '{{{ heading }}}',
			]
		);

		$this->end_controls_section();
	}

	private function render_slide( $slide, $index ) {
		$has_link = ! empty( $slide['link']['url'] );
		$btn_element = $has_link ? 'a' : 'span';

		if ( $has_link ) {
			$this->add_link_attributes( 'btn' . $index, $slide['link'] );
		}

		$btn_attributes = ' ' . $this->get_render_attribute_string( 'btn' . $index );
		$slide_attributes = ' ' . $this->get_render_attribute_string( 'slide' . $index );

		$heading = $slide['heading'] ? '<e-heading>' . $slide['heading'] . '</e-heading>' : '';
		$description = $slide['description'] ? '<p>' . $slide['description'] . '</p>' : '';
		$button = ! $slide['button_text'] ? '' :
			'<e-button><' . $btn_element . $btn_attributes . '>' . $slide['button_text'] . '</' . $btn_element . '></e-button>';

		return '<e-box' . $slide_attributes . '>' . $heading . $description . $button . '</e-box>';
	}

	private function render_slides() {
		$settings = $this->get_settings_for_display();
		$slides = [];
		$slide_count = 0;

		foreach ( $settings['slides'] as $slide ) {
			$slides[] = $this->render_slide( $slide, $slide_count );
			$slide_count++;
		}

		return implode( '', $slides );
	}

	protected function register_slots() {
		$this->add_slot( 'slides', [
			'content' => $this->render_slides(),
			'node_type' => 'none',
		] );
	}
}
