<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Media_Carousel extends Widget_Base {

	public function get_name() {
		return 'media-carousel';
	}

	public function get_title() {
		return __( 'Media Carousel', '' );
	}

	public function get_script_depends() {
		return [
			'jquery-swiper',
			'imagesloaded',
			'elementor-dialog',
		];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_slides',
			[
				'label' => 'Slides',
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'image',
			[
				'label' => 'Image',
				'type' => Controls_Manager::MEDIA,
			]
		);

		$repeater->add_control(
			'video',
			[
				'label' => 'Video',
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'Insert video link', 'elementor' ),
				'show_external' => false,
			]
		);

		$repeater->add_control(
			'text',
			[
				'label' => 'Text',
				'type' => Controls_Manager::TEXT,
			]
		);

		$this->add_control(
			'slides',
			[
				'label' => 'Slides',
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_fields(),
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_carousel',
			[
				'label' => __( 'Carousel' ),
			]
		);

		$this->add_control(
			'carousel_type',
			[
				'type' => Controls_Manager::SELECT,
				'label' => __( 'Carousel Type' ),
				'default' => 'classic',
				'options' => [
					'classic' => __( 'Classic' ),
				],
			]
		);

		$slides_per_view = range( 1, 10 );

		$slides_per_view = array_combine( $slides_per_view, $slides_per_view );

		$this->add_responsive_control(
			'slides_per_view',
			[
				'label' => __( 'Slides Per View', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [ '' => __( 'Default', 'elementor' ) ] + $slides_per_view,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pagination_type',
			[
				'label' => __( 'Pagination Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'bullets',
				'options' => [
					'bullets' => __( 'Bullets', 'elementor' ),
					'fraction' => __( 'Fraction', 'elementor' ),
					'progress' => __( 'Progress', 'elementor' ),
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'thumbnails',
			[
				'type' => Controls_Manager::SWITCHER,
				'label' => __( 'Thumbnails', 'elementor' ),
				'frontend_available' => true,
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_additional_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
			]
		);

		$this->add_control(
			'speed',
			[
				'label' => __( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'autoplay_speed',
			[
				'label' => __( 'Autoplay Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 5000,
				'condition' => [
					'autoplay' => 'yes',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pause_on_interaction',
			[
				'label' => __( 'Pause on interaction', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'loop',
			[
				'label' => __( 'Loop', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'frontend_available' => true,
			]
		);

		/*$this->add_control(
			'effect',
			[
				'label' => __( 'Effect', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'slide',
				'options' => [
					'slide' => __( 'Slide', 'elementor' ),
					'fade' => __( 'Fade', 'elementor' ),
				],
				'condition' => [
					'slides_to_show' => '1',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'direction',
			[
				'label' => __( 'Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'ltr',
				'options' => [
					'ltr' => __( 'Left', 'elementor' ),
					'rtl' => __( 'Right', 'elementor' ),
				],
				'frontend_available' => true,
			]
		);*/

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			[
				'label' => 'Carousel',
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'carousel_height',
			[
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 200,
				],
				'range' => [
					'px' => [
						'min' => 20,
						'max' => 1000,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-main-swiper' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_lightbox_style',
			[
				'label' => 'Lightbox',
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'lightbox_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'#elementor-carousel-lightbox-{{ID}}' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'lightbox_content_width',
			[
				'label' => __( 'Content Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'units' => [ '%' ],
				'default' => [
					'unit' => '%',
				],
				'range' => [
					'%' => [
						'min' => 50,
					],
				],
				'selectors' => [
					'#elementor-carousel-lightbox-{{ID}} .dialog-widget-content' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_active_settings();
		?>
		<div class="elementor-main-swiper swiper-container">
			<div class="swiper-wrapper">
				<?php foreach ( $settings['slides'] as $index => $image ) {
					$element_key = 'image' . $index;

					$this->add_render_attribute( $element_key, [
						'class' => 'swiper-slide',
						'style' => 'background-image: url(' . $image['image']['url'] . ')',
					] );

					if ( $image['video']['url'] ) {
						$embed_url_params = [
							'autoplay' => 1,
							'rel' => 0,
							'controls' => 0,
							'showinfo' => 0,
						];

						$this->add_render_attribute( $element_key, 'data-video-url', Embed::get_embed_url( $image['video']['url'], $embed_url_params ) );
					}
					?>
					<div <?php echo $this->get_render_attribute_string( $element_key ); ?>>
						<div class="elementor-media-carousel-image-title"><?php echo $image['text']; ?></div>
						<?php if ( $image['video']['url'] ) { ?>
							<div class="elementor-custom-embed-play">
								<i class="fa"></i>
							</div>
						<?php } ?>
					</div>
				<?php } ?>
			</div>
			<div class="swiper-pagination"></div>
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>
		</div>
		<?php if ( $settings['thumbnails'] ) { ?>
			<div class="elementor-thumbs-swiper swiper-container">
				<div class="swiper-wrapper">
					<?php foreach ( $settings['slides'] as $image ) { ?>
						<div class="swiper-slide" style="background-image: url('<?php echo $image['image']['url']; ?>')">
							<div class="elementor-media-carousel-image-title"><?php echo $image['text']; ?></div>
						</div>
					<?php } ?>
				</div>
			</div>
		<?php } ?>
	<?php }
}
