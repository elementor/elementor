<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\Promotions\Controls\Promotion_Control;

/**
 * Elementor image carousel widget.
 *
 * Elementor widget that displays a set of images in a rotating carousel or
 * slider.
 *
 * @since 1.0.0
 */
class Widget_Image_Carousel extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve image carousel widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'image-carousel';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve image carousel widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Image Carousel', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve image carousel widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-slider-push';
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
		return array( 'image', 'photo', 'visual', 'carousel', 'slider' );
	}

	protected function is_dynamic_content(): bool {
		return false;
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
		return array( 'e-swiper', 'widget-image-carousel' );
	}

	/**
	 * Get script dependencies.
	 *
	 * Retrieve the list of script dependencies the widget requires.
	 *
	 * @since 3.27.0
	 * @access public
	 *
	 * @return array Widget script dependencies.
	 */
	public function get_script_depends(): array {
		return array( 'swiper' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register image carousel widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_image_carousel',
			array(
				'label' => esc_html__( 'Image Carousel', 'elementor' ),
			)
		);

		$this->add_control(
			'carousel_name',
			array(
				'label' => esc_html__( 'Carousel Name', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => esc_html__( 'Image Carousel', 'elementor' ),
			)
		);

		$this->add_control(
			'carousel',
			array(
				'label' => esc_html__( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => array(),
				'show_label' => false,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name' => 'thumbnail', // Usage: `{name}_size` and `{name}_custom_dimension`, in this case `thumbnail_size` and `thumbnail_custom_dimension`.
			)
		);

		$slides_to_show = range( 1, 10 );
		$slides_to_show = array_combine( $slides_to_show, $slides_to_show );

		$this->add_responsive_control(
			'slides_to_show',
			array(
				'label' => esc_html__( 'Slides to Show', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
				) + $slides_to_show,
				'frontend_available' => true,
				'render_type' => 'template',
				'selectors' => array(
					'{{WRAPPER}}' => '--e-image-carousel-slides-to-show: {{VALUE}}',
				),
				'content_classes' => 'elementor-control-field-select-small',
			)
		);

		$this->add_responsive_control(
			'slides_to_scroll',
			array(
				'label' => esc_html__( 'Slides to Scroll', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => esc_html__( 'Set how many slides are scrolled per swipe.', 'elementor' ),
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
				) + $slides_to_show,
				'condition' => array(
					'slides_to_show!' => '1',
				),
				'frontend_available' => true,
				'content_classes' => 'elementor-control-field-select-small',
			)
		);

		$this->add_control(
			'image_stretch',
			array(
				'label' => esc_html__( 'Image Stretch', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'options' => array(
					'no' => esc_html__( 'No', 'elementor' ),
					'yes' => esc_html__( 'Yes', 'elementor' ),
				),
			)
		);

		$this->add_control(
			'navigation',
			array(
				'label' => esc_html__( 'Navigation', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'both',
				'options' => array(
					'both' => esc_html__( 'Arrows and Dots', 'elementor' ),
					'arrows' => esc_html__( 'Arrows', 'elementor' ),
					'dots' => esc_html__( 'Dots', 'elementor' ),
					'none' => esc_html__( 'None', 'elementor' ),
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'navigation_previous_icon',
			array(
				'label' => esc_html__( 'Previous Arrow Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => array(
					'inline' => array(
						'none' => array(
							'label' => 'Default',
							'icon' => 'eicon-chevron-left',
						),
						'icon' => array(
							'icon' => 'eicon-star',
						),
					),
				),
				'recommended' => array(
					'fa-regular' => array(
						'arrow-alt-circle-left',
						'caret-square-left',
					),
					'fa-solid' => array(
						'angle-double-left',
						'angle-left',
						'arrow-alt-circle-left',
						'arrow-circle-left',
						'arrow-left',
						'caret-left',
						'caret-square-left',
						'chevron-circle-left',
						'chevron-left',
						'long-arrow-alt-left',
					),
				),
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'navigation',
							'operator' => '=',
							'value' => 'both',
						),
						array(
							'name' => 'navigation',
							'operator' => '=',
							'value' => 'arrows',
						),
					),
				),
			)
		);

		$this->add_control(
			'navigation_next_icon',
			array(
				'label' => esc_html__( 'Next Arrow Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => array(
					'inline' => array(
						'none' => array(
							'label' => 'Default',
							'icon' => 'eicon-chevron-right',
						),
						'icon' => array(
							'icon' => 'eicon-star',
						),
					),
				),
				'recommended' => array(
					'fa-regular' => array(
						'arrow-alt-circle-right',
						'caret-square-right',
					),
					'fa-solid' => array(
						'angle-double-right',
						'angle-right',
						'arrow-alt-circle-right',
						'arrow-circle-right',
						'arrow-right',
						'caret-right',
						'caret-square-right',
						'chevron-circle-right',
						'chevron-right',
						'long-arrow-alt-right',
					),
				),
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'navigation',
							'operator' => '=',
							'value' => 'both',
						),
						array(
							'name' => 'navigation',
							'operator' => '=',
							'value' => 'arrows',
						),
					),
				),
			)
		);

		$this->add_control(
			'link_to',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'none',
				'options' => array(
					'none' => esc_html__( 'None', 'elementor' ),
					'file' => esc_html__( 'Media File', 'elementor' ),
					'custom' => esc_html__( 'Custom URL', 'elementor' ),
				),
			)
		);

		$this->add_control(
			'link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'condition' => array(
					'link_to' => 'custom',
				),
				'show_label' => false,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_control(
			'open_lightbox',
			array(
				'label' => esc_html__( 'Lightbox', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => sprintf(
					/* translators: 1: Link open tag, 2: Link close tag. */
					esc_html__( 'Manage your site’s lightbox settings in the %1$sLightbox panel%2$s.', 'elementor' ),
					'<a href="javascript: $e.run( \'panel/global/open\' ).then( () => $e.route( \'panel/global/settings-lightbox\' ) )">',
					'</a>'
				),
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'yes' => esc_html__( 'Yes', 'elementor' ),
					'no' => esc_html__( 'No', 'elementor' ),
				),
				'condition' => array(
					'link_to' => 'file',
				),
			)
		);

		$this->add_control(
			'caption_type',
			array(
				'label' => esc_html__( 'Caption', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'' => esc_html__( 'None', 'elementor' ),
					'title' => esc_html__( 'Title', 'elementor' ),
					'caption' => esc_html__( 'Caption', 'elementor' ),
					'description' => esc_html__( 'Description', 'elementor' ),
				),
			)
		);

		if ( ! Utils::has_pro() ) {
			$this->add_control(
				Utils::IMAGE_CAROUSEL . '_promotion',
				array(
					'label' => esc_html__( 'Carousel PRO widget', 'elementor' ),
					'type' => Promotion_Control::TYPE,
				)
			);
		}

		$this->end_controls_section();

		$this->start_controls_section(
			'section_additional_options',
			array(
				'label' => esc_html__( 'Additional Options', 'elementor' ),
			)
		);

		$this->add_control(
			'lazyload',
			array(
				'label' => esc_html__( 'Lazyload', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'autoplay',
			array(
				'label' => esc_html__( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'pause_on_hover',
			array(
				'label' => esc_html__( 'Pause on Hover', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'condition' => array(
					'autoplay' => 'yes',
				),
				'render_type' => 'none',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'pause_on_interaction',
			array(
				'label' => esc_html__( 'Pause on Interaction', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'condition' => array(
					'autoplay' => 'yes',
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'autoplay_speed',
			array(
				'label' => esc_html__( 'Autoplay Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 5000,
				'condition' => array(
					'autoplay' => 'yes',
				),
				'render_type' => 'none',
				'frontend_available' => true,
			)
		);

		// Loop requires a re-render so no 'render_type = none'
		$this->add_control(
			'infinite',
			array(
				'label' => esc_html__( 'Infinite Loop', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_on' => esc_html__( 'Yes', 'elementor' ),
				'label_off' => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default' => 'yes',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'effect',
			array(
				'label' => esc_html__( 'Effect', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'slide',
				'options' => array(
					'slide' => esc_html__( 'Slide', 'elementor' ),
					'fade' => esc_html__( 'Fade', 'elementor' ),
				),
				'condition' => array(
					'slides_to_show' => '1',
				),
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'speed',
			array(
				'label' => esc_html__( 'Animation Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'render_type' => 'none',
				'frontend_available' => true,
			)
		);

		$this->add_control(
			'direction',
			array(
				'label' => esc_html__( 'Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'ltr',
				'options' => array(
					'ltr' => esc_html__( 'Left', 'elementor' ),
					'rtl' => esc_html__( 'Right', 'elementor' ),
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_navigation',
			array(
				'label' => esc_html__( 'Navigation', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'navigation' => array( 'arrows', 'dots', 'both' ),
				),
			)
		);

		$this->add_control(
			'heading_style_arrows',
			array(
				'label' => esc_html__( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'navigation' => array( 'arrows', 'both' ),
				),
			)
		);

		$this->add_control(
			'arrows_position',
			array(
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'inside',
				'options' => array(
					'inside' => esc_html__( 'Inside', 'elementor' ),
					'outside' => esc_html__( 'Outside', 'elementor' ),
				),
				'prefix_class' => 'elementor-arrows-position-',
				'condition' => array(
					'navigation' => array( 'arrows', 'both' ),
				),
			)
		);

		$this->add_responsive_control(
			'arrows_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-prev, {{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-next' => 'font-size: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'navigation' => array( 'arrows', 'both' ),
				),
			)
		);

		$this->add_control(
			'arrows_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-prev, {{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-next' => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-prev svg, {{WRAPPER}} .elementor-swiper-button.elementor-swiper-button-next svg' => 'fill: {{VALUE}};',
				),
				'condition' => array(
					'navigation' => array( 'arrows', 'both' ),
				),
			)
		);

		$this->add_control(
			'heading_style_dots',
			array(
				'label' => esc_html__( 'Pagination', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->add_control(
			'dots_position',
			array(
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'outside',
				'options' => array(
					'outside' => esc_html__( 'Outside', 'elementor' ),
					'inside' => esc_html__( 'Inside', 'elementor' ),
				),
				'prefix_class' => 'elementor-pagination-position-',
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->add_responsive_control(
			'dots_gap',
			array(
				'label' => esc_html__( 'Space Between Dots', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 20,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => '--swiper-pagination-bullet-horizontal-gap: {{SIZE}}{{UNIT}}; --swiper-pagination-bullet-vertical-gap: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->add_responsive_control(
			'dots_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 20,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->add_control(
			'dots_inactive_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					// The opacity property will override the default inactive dot color which is opacity 0.2.
					'{{WRAPPER}} .swiper-pagination-bullet:not(.swiper-pagination-bullet-active)' => 'background: {{VALUE}}; opacity: 1',
				),
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->add_control(
			'dots_color',
			array(
				'label' => esc_html__( 'Active Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}} .swiper-pagination-bullet' => 'background: {{VALUE}};',
				),
				'condition' => array(
					'navigation' => array( 'dots', 'both' ),
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_image',
			array(
				'label' => esc_html__( 'Image', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'gallery_vertical_align',
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
				'condition' => array(
					'slides_to_show!' => '1',
				),
				'selectors' => array(
					'{{WRAPPER}} .swiper-wrapper' => 'display: flex; align-items: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'image_spacing',
			array(
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
				'default' => '',
				'condition' => array(
					'slides_to_show!' => '1',
				),
			)
		);

		$this->add_responsive_control(
			'image_spacing_custom',
			array(
				'label' => esc_html__( 'Image Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
				),
				'default' => array(
					'size' => 20,
				),
				'condition' => array(
					'image_spacing' => 'custom',
					'slides_to_show!' => '1',
				),
				'frontend_available' => true,
				'render_type' => 'none',
				'separator' => 'after',
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'image_border',
				'selector' => '{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .swiper-slide-image',
			)
		);

		$this->add_responsive_control(
			'image_border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .swiper-slide-image' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_caption',
			array(
				'label' => esc_html__( 'Caption', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'caption_type!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'caption_align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
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
				'default' => 'center',
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-carousel-caption' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'caption_text_color',
			array(
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-carousel-caption' => 'color: {{VALUE}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'caption_typography',
				'global' => array(
					'default' => Global_Colors::COLOR_ACCENT,
				),
				'selector' => '{{WRAPPER}} .elementor-image-carousel-caption',
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'caption_shadow',
				'selector' => '{{WRAPPER}} .elementor-image-carousel-caption',
			)
		);

		$this->add_responsive_control(
			'caption_space',
			array(
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-carousel-caption' => 'margin-block-start: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render image carousel widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$lazyload = 'yes' === $settings['lazyload'];

		if ( empty( $settings['carousel'] ) ) {
			return;
		}

		$slides = array();

		foreach ( $settings['carousel'] as $index => $attachment ) {
			$image_url = Group_Control_Image_Size::get_attachment_image_src( $attachment['id'], 'thumbnail', $settings );

			if ( ! $image_url && isset( $attachment['url'] ) ) {
				$image_url = $attachment['url'];
			}

			if ( $lazyload ) {
				$image_html = '<img class="swiper-slide-image swiper-lazy" data-src="' . esc_attr( $image_url ) . '" alt="' . esc_attr( Control_Media::get_image_alt( $attachment ) ) . '" />';
			} else {
				$image_html = '<img class="swiper-slide-image" src="' . esc_attr( $image_url ) . '" alt="' . esc_attr( Control_Media::get_image_alt( $attachment ) ) . '" />';
			}

			$link_tag = '';

			$link = $this->get_link_url( $attachment, $settings );

			if ( $link ) {
				$link_key = 'link_' . $index;

				$this->add_lightbox_data_attributes( $link_key, $attachment['id'], $settings['open_lightbox'], $this->get_id() );

				if ( Plugin::$instance->editor->is_edit_mode() ) {
					$this->add_render_attribute( $link_key, array(
						'class' => 'elementor-clickable',
					) );
				}

				$this->add_link_attributes( $link_key, $link );

				$link_tag = '<a ' . $this->get_render_attribute_string( $link_key ) . '>';
			}

			$image_caption = $this->get_image_caption( $attachment );

			$slide_count = $index + 1;
			$slide_setting_key = 'swiper_slide_' . $index;

			$this->add_render_attribute( $slide_setting_key, array(
				'class' => 'swiper-slide',
				'role' => 'group',
				'aria-roledescription' => 'slide',
				'aria-label' => sprintf(
					/* translators: 1: Slide count, 2: Total slides count. */
					esc_html__( '%1$s of %2$s', 'elementor' ),
					$slide_count,
					count( $settings['carousel'] )
				),
			) );

			$slide_html = '<div ' . $this->get_render_attribute_string( $slide_setting_key ) . '>' . $link_tag . '<figure class="swiper-slide-inner">' . $image_html;

			if ( $lazyload ) {
				$slide_html .= '<div class="swiper-lazy-preloader"></div>';
			}

			if ( ! empty( $image_caption ) ) {
				$slide_html .= '<figcaption class="elementor-image-carousel-caption">' . wp_kses_post( $image_caption ) . '</figcaption>';
			}

			$slide_html .= '</figure>';

			if ( $link ) {
				$slide_html .= '</a>';
			}

			$slide_html .= '</div>';

			$slides[] = $slide_html;

		}

		if ( empty( $slides ) ) {
			return;
		}

		$swiper_class = 'swiper';
		$has_autoplay_enabled = 'yes' === $this->get_settings_for_display( 'autoplay' );

		$this->add_render_attribute( array(
			'carousel' => array(
				'class' => 'elementor-image-carousel swiper-wrapper',
				'aria-live' => $has_autoplay_enabled ? 'off' : 'polite',
			),
			'carousel-wrapper' => array(
				'class' => 'elementor-image-carousel-wrapper ' . $swiper_class,
				'role' => 'region',
				'aria-roledescription' => 'carousel',
				'aria-label' => $settings['carousel_name'],
				'dir' => $settings['direction'],
			),
		) );

		$show_dots = ( in_array( $settings['navigation'], array( 'dots', 'both' ) ) );
		$show_arrows = ( in_array( $settings['navigation'], array( 'arrows', 'both' ) ) );

		if ( 'yes' === $settings['image_stretch'] ) {
			$this->add_render_attribute( 'carousel', 'class', 'swiper-image-stretch' );
		}

		$slides_count = count( $settings['carousel'] );
		?>
		<div <?php $this->print_render_attribute_string( 'carousel-wrapper' ); ?>>
			<div <?php $this->print_render_attribute_string( 'carousel' ); ?>>
				<?php // PHPCS - $slides contains the slides content, all the relevant content is escaped above. ?>
				<?php echo implode( '', $slides ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<?php if ( 1 < $slides_count ) : ?>
				<?php if ( $show_arrows ) : ?>
					<div class="elementor-swiper-button elementor-swiper-button-prev" role="button" tabindex="0">
						<?php $this->render_swiper_button( 'previous' ); ?>
					</div>
					<div class="elementor-swiper-button elementor-swiper-button-next" role="button" tabindex="0">
						<?php $this->render_swiper_button( 'next' ); ?>
					</div>
				<?php endif; ?>

				<?php if ( $show_dots ) : ?>
					<div class="swiper-pagination"></div>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Retrieve image carousel link URL.
	 *
	 * @since 1.0.0
	 * @access private
	 *
	 * @param array  $attachment
	 * @param object $instance
	 *
	 * @return array|string|false An array/string containing the attachment URL, or false if no link.
	 */
	private function get_link_url( $attachment, $instance ) {
		if ( 'none' === $instance['link_to'] ) {
			return false;
		}

		if ( 'custom' === $instance['link_to'] ) {
			if ( empty( $instance['link']['url'] ) ) {
				return false;
			}

			return $instance['link'];
		}

		return array(
			'url' => wp_get_attachment_url( $attachment['id'] ),
		);
	}

	/**
	 * Retrieve image carousel caption.
	 *
	 * @since 1.2.0
	 * @access private
	 *
	 * @param array $attachment
	 *
	 * @return string The caption of the image.
	 */
	private function get_image_caption( $attachment ) {
		$caption_type = $this->get_settings_for_display( 'caption_type' );

		if ( empty( $caption_type ) ) {
			return '';
		}

		$attachment_post = get_post( $attachment['id'] );

		if ( Utils::has_invalid_post_permissions( $attachment_post ) ) {
			return '';
		}

		if ( 'caption' === $caption_type ) {
			return $attachment_post->post_excerpt;
		}

		if ( 'title' === $caption_type ) {
			return $attachment_post->post_title;
		}

		if ( empty( $attachment_post->post_content ) ) {
			return '';
		}

		return $attachment_post->post_content;
	}

	private function render_swiper_button( $type ) {
		$direction = 'next' === $type ? 'right' : 'left';
		$icon_settings = $this->get_settings_for_display( 'navigation_' . $type . '_icon' );

		if ( empty( $icon_settings['value'] ) ) {
			$icon_settings = array(
				'library' => 'eicons',
				'value' => 'eicon-chevron-' . $direction,
			);
		}

		Icons_Manager::render_icon( $icon_settings, array( 'aria-hidden' => 'true' ) );
	}
}
