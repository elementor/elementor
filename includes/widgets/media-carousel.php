<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Media_Carousel extends Widget_Base {

	public function get_name() {
		return 'media-carousel';
	}

	public function get_title() {
		return __( 'Media Carousel', 'elementor' );
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
				'label' => __( 'Slides', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'type',
			[
				'type' => Controls_Manager::CHOOSE,
				'label' => __( 'Type', 'elementor' ),
				'default' => 'image',
				'options' => [
					'image' => [
						'title' => __( 'Image', 'elementor' ),
						'icon' => __( 'fa fa-image', 'elementor' ),
					],
					'video' => [
						'title' => __( 'Video', 'elementor' ),
						'icon' => __( 'fa fa-video-camera', 'elementor' ),
					],
				],
				'label_block' => false,
				'toggle' => false,
			]
		);

		$repeater->add_control(
			'image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
			]
		);

		$repeater->add_control(
			'image_link_to_type',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'None', 'elementor' ),
					'file' => __( 'Media File', 'elementor' ),
					'custom' => __( 'Custom URL', 'elementor' ),
				],
				'condition' => [
					'type' => 'image',
				],
			]
		);

		$repeater->add_control(
			'image_link_to',
			[
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'condition' => [
					'type' => 'image',
					'image_link_to_type' => 'custom',
				],
				'separator' => 'none',
				'show_label' => false,
			]
		);

		$repeater->add_control(
			'video',
			[
				'label' => __( 'Video Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'Enter your video link', 'elementor' ),
				'description' => __( 'Insert YouTube or Vimeo link', 'elementor' ),
				'show_external' => false,
				'condition' => [
					'type' => 'video',
				],
			]
		);

		$repeater->add_control(
			'caption_type',
			[
				'label' => __( 'Caption Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => __( 'None', 'elementor' ),
					'title' => __( 'Title', 'elementor' ),
					'caption' => __( 'Caption', 'elementor' ),
					'description' => __( 'Description', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'slides',
			[
				'label' => __( 'Slides', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_fields(),
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_carousel',
			[
				'label' => __( 'Carousel', 'elementor' ),
			]
		);

		$this->add_control(
			'effect',
			[
				'type' => Controls_Manager::SELECT,
				'label' => __( 'Effect', 'elementor' ),
				'default' => 'slide',
				'options' => [
					'slide' => __( 'Slide', 'elementor' ),
					'fade' => __( 'Fade', 'elementor' ),
					'flip' => __( 'Flip', 'elementor' ),
					'cube' => __( 'Cube', 'elementor' ),
					'coverflow' => __( 'Coverflow', 'elementor' ),
				],
				'frontend_available' => true,
			]
		);

		$slides_per_view = range( 1, 10 );

		$slides_per_view = array_combine( $slides_per_view, $slides_per_view );

		$this->add_responsive_control(
			'slides_per_view',
			[
				'type' => Controls_Manager::SELECT,
				'label' => __( 'Slides Per View', 'elementor' ),
				'options' => [ '' => __( 'Default', 'elementor' ) ] + $slides_per_view,
				'condition' => [
					'effect' => 'slide',
				],
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'height',
			[
				'type' => Controls_Manager::SLIDER,
				'label' => __( 'Height', 'elementor' ),
				'default' => [
					'size' => 230,
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

		$this->add_control(
			'show_arrows',
			[
				'type' => Controls_Manager::SWITCHER,
				'label' => __( 'Navigation Arrows', 'elementor' ),
				'default' => 'yes',
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'pagination',
			[
				'label' => __( 'Pagination', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'bullets',
				'options' => [
					'' => __( 'None', 'elementor' ),
					'bullets' => __( 'Bullets', 'elementor' ),
					'fraction' => __( 'Fraction', 'elementor' ),
					'progress' => __( 'Progress', 'elementor' ),
				],
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

		$this->end_controls_section();

		$this->start_controls_section(
			'section_navigation',
			[
				'label' => __( 'Navigation', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'navigation_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 20,
				],
				'range' => [
					'px' => [
						'min' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-swiper-button' => 'font-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'navigation_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-swiper-button' => 'color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_pagination',
			[
				'label' => __( 'Pagination', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'pagination_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'selectors' => [
					'{{WRAPPER}} .swiper-pagination-bullet' => 'height: {{SIZE}}{{UNIT}}; width: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .swiper-container-horizontal .swiper-pagination-progress' => 'height: {{SIZE}}{{UNIT}}',
					'{{WRAPPER}} .swiper-pagination-fraction' => 'font-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'pagination_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .swiper-pagination-bullet-active, {{WRAPPER}} .swiper-pagination-progressbar' => 'background-color: {{VALUE}}',
					'{{WRAPPER}} .swiper-pagination-fraction' => 'color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_caption',
			[
				'label' => __( 'Caption', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'caption_align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'fa fa-align-justify',
					],
				],
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}} .elementor-media-carousel-image-caption' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'caption_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-media-carousel-image-caption' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'caption_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'selector' => '{{WRAPPER}} .elementor-media-carousel-image-caption',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_lightbox_style',
			[
				'label' => __( 'Lightbox', 'elementor' ),
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

	private function get_image_caption( $slide ) {
		$caption_type = $slide['caption_type'];

		if ( empty( $caption_type ) ) {
			return '';
		}

		$attachment_post = get_post( $slide['image']['id'] );

		if ( 'caption' === $caption_type ) {
			return $attachment_post->post_excerpt;
		}

		if ( 'title' === $caption_type ) {
			return $attachment_post->post_title;
		}

		return $attachment_post->post_content;
	}

	private function get_image_link_to( $slide ) {
		if ( ! $slide['image_link_to_type'] ) {
			return '';
		}

		if ( 'custom' === $slide['image_link_to_type'] ) {
			return $slide['image_link_to']['url'];
		}

		return $slide['image']['url'];
	}

	protected function render() {
		$settings = $this->get_active_settings();
		?>
		<div class="elementor-main-swiper swiper-container">
			<div class="swiper-wrapper">
				<?php foreach ( $settings['slides'] as $index => $slide ) {
					$element_key = 'slide-' . $index;

					$this->add_render_attribute( $element_key, [
						'class' => 'swiper-slide',
					] );

					$this->add_render_attribute( $element_key . '-image', [
						'class' => 'elementor-media-carousel-image',
						'style' => 'background-image: url(' . $slide['image']['url'] . ')',
					] );

					if ( $slide['video']['url'] ) {
						$embed_url_params = [
							'autoplay' => 1,
							'rel' => 0,
							'controls' => 0,
							'showinfo' => 0,
						];

						$this->add_render_attribute( $element_key, 'data-video-url', Embed::get_embed_url( $slide['video']['url'], $embed_url_params ) );
					}
					?>
					<div <?php echo $this->get_render_attribute_string( $element_key ); ?>>
						<?php
						$image_link_to = $this->get_image_link_to( $slide );

						if ( $image_link_to ) {
							$this->add_render_attribute( $element_key . '_link', 'href', $image_link_to );

							if ( 'custom' === $slide['image_link_to_type'] ) {
								if ( $slide['image_link_to']['is_external'] ) {
									$this->add_render_attribute( $element_key . '_link', 'target', '_blank' );
								}

								if ( $slide['image_link_to']['nofollow'] ) {
									$this->add_render_attribute( $element_key . '_link', 'nofollow', '' );
								}
							}

							echo '<a ' . $this->get_render_attribute_string( $element_key . '_link' ) . '>';
						} ?>
						<div <?php echo $this->get_render_attribute_string( $element_key . '-image' ); ?>>
							<?php if ( 'video' === $slide['type'] ) { ?>
								<div class="elementor-custom-embed-play">
									<i class="fa"></i>
								</div>
							<?php } ?>
						</div>
						<div class="elementor-media-carousel-image-caption"><?php echo $this->get_image_caption( $slide ); ?></div>
						<?php
						if ( $image_link_to ) {
							echo '</a>';
						} ?>
					</div>
				<?php } ?>
			</div>
			<?php if ( $settings['pagination'] ) { ?>
				<div class="swiper-pagination"></div>
			<?php } ?>
			<?php if ( $settings['show_arrows'] ) { ?>
				<div class="elementor-swiper-button elementor-swiper-button-prev">
					<i class="fa fa-chevron-left"></i>
				</div>
				<div class="elementor-swiper-button elementor-swiper-button-next">
					<i class="fa fa-chevron-right"></i>
				</div>
			<?php } ?>
		</div>
	<?php }
}
