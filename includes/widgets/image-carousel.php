<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image_Carousel extends Widget_Base {
	private $_carusel_options = [];

	public function get_id() {
		return 'image-carousel';
	}

	public function get_title() {
		return __( 'Image Carousel', 'elementor' );
	}

	public function get_icon() {
		return 'slider-push';
	}

	protected function _register_controls() {
		$this->_carusel_options = [ 'slidesToShow', 'slidesToScroll', 'autoplaySpeed', 'autoplay', 'dots', 'dotspos', 'arrows', 'arrowspos', 'infinite', 'pauseOnHover', 'speed', 'fade', 'rtl' ];

		$this->add_control(
			'section_image_carousel',
			[
				'label' => __( 'Image Carousel', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'carousel',
			[
				'label' => __( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => [],
				'section' => 'section_image_carousel',
			]
		);

		$this->add_group_control(
			Group_Control_Image_size::get_type(),
			[
				'name' => 'thumbnail',
				'section' => 'section_image_carousel',
			]
		);

		$slides_to_show = range( 1, 10 );
		$slides_to_show = array_combine( $slides_to_show, $slides_to_show );

		$this->add_control(
			'slidesToShow',
			[
				'label' => __( 'Slides to Show', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '3',
				'section' => 'section_image_carousel',
				'options' => $slides_to_show,
			]
		);

		$this->add_control(
			'slidesToScroll',
			[
				'label' => __( 'Slides to Scroll', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '2',
				'section' => 'section_image_carousel',
				'options' => $slides_to_show,
				'condition' => [
					'slidesToShow!' => '1',
				],
			]
		);

		$this->add_control(
			'image_stretch',
			[
				'label' => __( 'Image Stretch', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'section' => 'section_image_carousel',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image_carousel',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image_carousel',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_image_carousel',
			]
		);

		$this->add_control(
			'section_additional_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'pauseOnHover',
			[
				'label' => __( 'Pause On Hover', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplaySpeed',
			[
				'label' => __( 'Autoplay Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 5000,
				'section' => 'section_additional_options',
			]
		);

		$this->add_control(
			'infinite',
			[
				'label' => __( 'Infinite Loop', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'fade',
			[
				'label' => __( 'Effect', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_additional_options',
				'options' => [
					'false' => __( 'Slide', 'elementor' ),
					'true' => __( 'Fade', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'speed',
			[
				'label' => __( 'Animation Speed (ms)', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'section' => 'section_additional_options',
			]
		);

		$this->add_control(
			'rtl',
			[
				'label' => __( 'Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_additional_options',
				'options' => [
					'false' => __( 'Left to Right', 'elementor' ),
					'true' => __( 'Right to Left', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'section_style_carousel',
			[
				'label' => __( 'Carousel', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'image_spacing',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
				'default' => '',
				'condition' => [
					'slidesToShow!' => '1',
				],
			]
		);

		$this->add_control(
			'image_spacing_custom',
			[
				'label' => __( 'Image Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'range' => [
					'px' => [
						'max' => 100,
					],
				],
				'default' => [
					'size' => 20,
				],
				'show_label' => false,
				'condition' => [
					'image_spacing' => 'custom',
					'slidesToShow!' => '1',
				],
				'selectors' => [
					'{{WRAPPER}} .slick-list' => 'margin: 0 -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .slick-slide' => 'margin: 0 {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'heading_style_arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'separator' => 'before',
				'condition' => [
					'arrows' => 'true',
				],
			]
		);

		$this->add_control(
			'arrowspos',
			[
				'label' => __( 'Arrows Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'inside',
				'section' => 'section_style_carousel',
				'tab' => self::TAB_STYLE,
				'options' => [
					'inside' => __( 'Inside', 'elementor' ),
					'outside' => __( 'Outside', 'elementor' ),
				],
				'condition' => [
					'arrows' => 'true',
				],
			]
		);

		$this->add_control(
			'arrows_size',
			[
				'label' => __( 'Arrows Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'section' => 'section_style_carousel',
				'tab' => self::TAB_STYLE,
				'default' => [
					'size' => 20,
				],
				'range' => [
					'px' => [
						'min' => 20,
						'max' => 60,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-prev:before, {{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-next:before' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'arrows' => 'true',
				],
			]
		);

		$this->add_control(
			'arrows_color',
			[
				'label' => __( 'Arrows Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#000000',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-prev:before, {{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-next:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'arrows' => 'true',
				],
			]
		);

		$this->add_control(
			'heading_style_dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'separator' => 'before',
				'condition' => [
					'dots' => 'true',
				],
			]
		);

		$this->add_control(
			'dotspos',
			[
				'label' => __( 'Dots Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'outside',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'options' => [
					'outside' => __( 'Outside', 'elementor' ),
					'inside' => __( 'inside', 'elementor' ),
				],
				'condition' => [
					'dots' => 'true',
				],
			]
		);

		$this->add_control(
			'dots_size',
			[
				'label' => __( 'Dots Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'default' => [
					'size' => 6,
				],
				'range' => [
					'px' => [
						'min' => 5,
						'max' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .slick-dots li button:before' => 'font-size: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'dots' => 'true',
				],
			]
		);

		$this->add_control(
			'dots_color',
			[
				'label' => __( 'Dots Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#000',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .slick-dots li button:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'dots' => 'true',
				],
			]
		);

		$this->add_control(
			'heading_style_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'separator' => 'before',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_control(
			'image_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_carousel',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['carousel'] ) )
			return;

		$slides = [];
		foreach ( $instance['carousel'] as $attachment ) {
			$image = Group_Control_Image_size::get_attachment_image_src( $attachment['id'], 'thumbnail', $instance );

			$image_classes = [ 'slick-slide-image' ];
			if ( 'yes' === $instance['image_stretch'] ) {
				$image_classes[] = 'slick-slide-image-stretch';
			}

			$slides[] = '<div><img class="' . implode( ' ', $image_classes ) . '" src="' . esc_attr( $image ) . '" alt="Image Carousel" /></div>';
		}

		if ( empty( $slides ) ) {
			return;
		}

		foreach ( $this->_carusel_options as $option_name ) {
			$this->add_render_attribute( 'data', 'data-' . $option_name , $instance[ $option_name ] );
		}

		?>
		<div class="elementor-image-carousel-wrapper"<?php if ( 'true' === $instance['rtl'] ) echo ' dir="rtl"'; ?>>
			<div class="elementor-image-carousel" <?php echo $this->get_render_attribute_string( 'data' ); ?>>
				<?php echo implode( '', $slides ); ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
