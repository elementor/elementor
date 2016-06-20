<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Carousel extends Widget_Base {
	private $_carusel_options = [];

	public function get_id() {
		return 'carousel';
	}

	public function get_title() {
		return __( 'Image Carousel', 'elementor' );
	}

	public function get_icon() {
		return 'carousel';
	}

	protected function _register_controls() {
		$this->_carusel_options = [ 'slidesToShow', 'slidesToScroll', 'autoplaySpeed', 'autoplay', 'dots', 'dotspos', 'arrows', 'arrowspos', 'infinite', 'pauseOnHover', 'rtl' ];

		$this->add_control(
			'section_image',
			[
				'label' => __( 'Carousel Gallery', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'carousel',
			[
				'label' => __( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => [],
				'section' => 'section_image',
			]
		);

		$this->add_group_control(
			Group_Control_Image_size::get_type(),
			[
				'name' => 'thumbnail',
				'section' => 'section_image',
			]
		);

		$slides_to_show = range( 1, 10 );
		$slides_to_show = array_combine( $slides_to_show, $slides_to_show );

		$this->add_control(
			'slidesToShow',
			[
				'label' => __( 'Slides to show', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '3',
				'section' => 'section_image',
				'options' => $slides_to_show,
			]
		);

		$this->add_control(
			'slidesToScroll',
			[
				'label' => __( 'Slides to scroll', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '3',
				'section' => 'section_image',
				'options' => $slides_to_show,
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
			'gallery_gap',
			[
				'label' => __( 'Carusel Gap', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_additional_options',
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
			'columns_padding',
			[
				'label' => __( 'Carusel Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 5,
				],
				'range' => [
					'px' => [
						'max' => 100,
					],
				],
				'condition' => [
					'gallery_gap' => 'custom',
					'slidesToShow!' => '1',
				],
				'section' => 'section_additional_options',
				'selectors' => [
					'{{WRAPPER}} .slick-list' => 'margin: 0 -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .slick-slide' => 'margin: 0 {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'arrows_color',
			[
				'label' => __( 'Arrows Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#000',
				'section' => 'section_additional_options',
				'selectors' => [
					'{{WRAPPER}} .elementor-carousel-wrapper .slick-slider .slick-prev:before, {{WRAPPER}} .elementor-carousel-wrapper .slick-slider .slick-next:before' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'arrows_size',
			[
				'label' => __( 'Arrows Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'section' => 'section_additional_options',
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
					'{{WRAPPER}} .elementor-carousel-wrapper .slick-slider .slick-prev:before, {{WRAPPER}} .elementor-carousel-wrapper .slick-slider .slick-next:before' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'arrowspos',
			[
				'label' => __( 'Arrows Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'inside',
				'section' => 'section_additional_options',
				'options' => [
					'inside' => __( 'Inside', 'elementor' ),
					'outside' => __( 'Outside', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'dots_color',
			[
				'label' => __( 'Dots Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#000',
				'section' => 'section_additional_options',
				'selectors' => [
					'{{WRAPPER}} .elementor-carousel-wrapper .elementor-carousel .slick-dots li button:before' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'dots_size',
			[
				'label' => __( 'Dots Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'section' => 'section_additional_options',
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
					'{{WRAPPER}} .elementor-carousel-wrapper .elementor-carousel .slick-dots li button:before' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'dotspos',
			[
				'label' => __( 'Dots Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'outside',
				'section' => 'section_additional_options',
				'options' => [
					'outside' => __( 'Outside', 'elementor' ),
					'inside' => __( 'inside', 'elementor' ),
				],
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
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['carousel'] ) )
			return;

		foreach ( $this->_carusel_options as $option_name ) {
			$this->add_render_attribute( 'data', 'data-' . $option_name , $instance[ $option_name ] );
		}
		?>
		<div class="elementor-carousel-wrapper"<?php if ( 'true' === $instance['rtl'] ) echo ' dir="rtl"'; ?>>
			<div class="elementor-carousel" <?php echo $this->get_render_attribute_string( 'data' ); ?>>
				<?php
				$slides = '';
				foreach ( $instance['carousel'] as $attachment ) :
					$image = Group_Control_Image_size::get_attachment_image_src( $attachment['id'], 'thumbnail', $instance );
					$slides .= '<div><img src="' . $image . '" /></div>';
				endforeach;

				echo $slides; ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
