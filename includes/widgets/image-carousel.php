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
			'slides_to_show',
			[
				'label' => __( 'Slides to Show', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '3',
				'section' => 'section_image_carousel',
				'options' => $slides_to_show,
			]
		);

		$this->add_control(
			'slides_to_scroll',
			[
				'label' => __( 'Slides to Scroll', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '2',
				'section' => 'section_image_carousel',
				'options' => $slides_to_show,
				'condition' => [
					'slides_to_show!' => '1',
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
				'default' => 'yes',
				'section' => 'section_image_carousel',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'yes',
				'section' => 'section_image_carousel',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
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
			'pause_on_hover',
			[
				'label' => __( 'Pause on Hover', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'yes',
				'section' => 'section_additional_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'yes',
				'section' => 'section_additional_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplay_speed',
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
				'default' => 'yes',
				'section' => 'section_additional_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'effect',
			[
				'label' => __( 'Effect', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'slide',
				'section' => 'section_additional_options',
				'options' => [
					'slide' => __( 'Slide', 'elementor' ),
					'fade' => __( 'Fade', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'speed',
			[
				'label' => __( 'Animation Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'section' => 'section_additional_options',
			]
		);

		$this->add_control(
			'direction',
			[
				'label' => __( 'Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'ltr',
				'section' => 'section_additional_options',
				'options' => [
					'ltr' => __( 'Left to Right', 'elementor' ),
					'rtl' => __( 'Right to Left', 'elementor' ),
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
					'slides_to_show!' => '1',
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
				'selectors' => [
					'{{WRAPPER}} .slick-list' => 'margin: 0 -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .slick-slide' => 'margin: 0 {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'image_spacing' => 'custom',
					'slides_to_show!' => '1',
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
					'arrows' => 'yes',
				],
			]
		);

		$this->add_control(
			'arrows_position',
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
					'arrows' => 'yes',
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
					'arrows' => 'yes',
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
					'arrows' => 'yes',
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
					'dots' => 'yes',
				],
			]
		);

		$this->add_control(
			'dots_position',
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
					'dots' => 'yes',
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
					'dots' => 'yes',
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
					'dots' => 'yes',
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
				'selector' => '{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .slick-slide-image',
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
					'{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .slick-slide-image' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['carousel'] ) )
			return;

		$slides = [];
		foreach ( $instance['carousel'] as $attachment ) {
			$image_url = Group_Control_Image_size::get_attachment_image_src( $attachment['id'], 'thumbnail', $instance );

			$image_classes = [ 'slick-slide-image' ];
			if ( 'yes' === $instance['image_stretch'] ) {
				$image_classes[] = 'slick-slide-image-stretch';
			}

			$slides[] = '<div><img class="' . implode( ' ', $image_classes ) . '" src="' . esc_attr( $image_url ) . '" alt="Image Carousel" /></div>';
		}

		if ( empty( $slides ) ) {
			return;
		}

		$is_slideshow = '1' === $instance['slides_to_show'];
		$is_rtl = ( 'rtl' === $instance['direction'] );

		$slick_options = [
			'slidesToShow' => $instance['slides_to_show'],
			'autoplaySpeed' => $instance['autoplay_speed'],
			'autoplay' => ( 'yes' === $instance['autoplay'] ),
			'arrows' => ( 'yes' === $instance['arrows'] ),
			'dots' => ( 'yes' === $instance['dots'] ),
			'infinite' => ( 'yes' === $instance['infinite'] ),
			'pauseOnHover' => ( 'yes' === $instance['pause_on_hover'] ),
			'speed' => $instance['speed'],
			'fade' => ( 'fade' === $instance['effect'] ),
			'rtl' => $is_rtl,
		];

		$carousel_classes = [ 'elementor-image-carousel' ];

		if ( 'yes' === $instance['arrows'] ) {
			$slick_options['arrows'] = true;
			$carousel_classes[] = 'slick-arrows-' . $instance['arrows_position'];
		}

		if ( 'yes' === $instance['dots'] ) {
			$slick_options['dots'] = true;
			$carousel_classes[] = 'slick-dots-' . $instance['dots_position'];
		}

		if ( ! $is_slideshow ) {
			$slick_options['slidesToScroll'] = $instance['slides_to_scroll'];
		}

		?>
		<div class="elementor-image-carousel-wrapper"<?php if ( $is_rtl ) echo ' dir="rtl"'; ?>>
			<div class="<?php echo implode( ' ', $carousel_classes ); ?>" data-slider_options='<?php echo wp_json_encode( $slick_options ); ?>'>
				<?php echo implode( '', $slides ); ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
