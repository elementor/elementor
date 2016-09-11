<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image_Carousel extends Widget_Base {

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
			'navigation',
			[
				'label' => __( 'Navigation', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'both',
				'section' => 'section_image_carousel',
				'options' => [
					'both' => __( 'Arrows and Dots', 'elementor' ),
					'arrows' => __( 'Arrows', 'elementor' ),
					'dots' => __( 'Dots', 'elementor' ),
					'none' => __( 'None', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'link_to',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'none',
				'section' => 'section_image_carousel',
				'options' => [
					'none' => __( 'None', 'elementor' ),
					'file' => __( 'Media File', 'elementor' ),
					'custom' => __( 'Custom URL', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'link',
			[
				'label' => 'Link to',
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'section' => 'section_image_carousel',
				'condition' => [
					'link_to' => 'custom',
				],
				'show_label' => false,
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
			'test_switcher',
			[
				'label' => __( 'Show logo', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'section' => 'section_additional_options',
				'default' => 'show',
				'label_off' => 'hide',
				'label_on' => 'show',
				'return_value' => 'show',
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
				'condition' => [
					'slides_to_show' => '1',
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
					'ltr' => __( 'Left', 'elementor' ),
					'rtl' => __( 'Right', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'section_style_navigation',
			[
				'label' => __( 'Navigation', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
				'condition' => [
					'navigation' => [ 'arrows', 'dots', 'both' ],
				],
			]
		);

		$this->add_control(
			'heading_style_arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_navigation',
				'separator' => 'before',
				'condition' => [
					'navigation' => [ 'arrows', 'both' ],
				],
			]
		);

		$this->add_control(
			'arrows_position',
			[
				'label' => __( 'Arrows Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'inside',
				'section' => 'section_style_navigation',
				'tab' => self::TAB_STYLE,
				'options' => [
					'inside' => __( 'Inside', 'elementor' ),
					'outside' => __( 'Outside', 'elementor' ),
				],
				'condition' => [
					'navigation' => [ 'arrows', 'both' ],
				],
			]
		);

		$this->add_control(
			'arrows_size',
			[
				'label' => __( 'Arrows Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'section' => 'section_style_navigation',
				'tab' => self::TAB_STYLE,
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
					'navigation' => [ 'arrows', 'both' ],
				],
			]
		);

		$this->add_control(
			'arrows_color',
			[
				'label' => __( 'Arrows Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_navigation',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-prev:before, {{WRAPPER}} .elementor-image-carousel-wrapper .slick-slider .slick-next:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'navigation' => [ 'arrows', 'both' ],
				],
			]
		);

		$this->add_control(
			'heading_style_dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_navigation',
				'separator' => 'before',
				'condition' => [
					'navigation' => [ 'dots', 'both' ],
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
				'section' => 'section_style_navigation',
				'options' => [
					'outside' => __( 'Outside', 'elementor' ),
					'inside' => __( 'Inside', 'elementor' ),
				],
				'condition' => [
					'navigation' => [ 'dots', 'both' ],
				],
			]
		);

		$this->add_control(
			'dots_size',
			[
				'label' => __( 'Dots Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_navigation',
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
					'navigation' => [ 'dots', 'both' ],
				],
			]
		);

		$this->add_control(
			'dots_color',
			[
				'label' => __( 'Dots Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_navigation',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-carousel-wrapper .elementor-image-carousel .slick-dots li button:before' => 'color: {{VALUE}};',
				],
				'condition' => [
					'navigation' => [ 'dots', 'both' ],
				],
			]
		);

		$this->add_control(
			'section_style_image',
			[
				'label' => __( 'Image', 'elementor' ),
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
				'section' => 'section_style_image',
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
				'section' => 'section_style_image',
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
					'{{WRAPPER}} .slick-list' => 'margin-left: -{{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .slick-slide .slick-slide-inner' => 'padding-left: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'image_spacing' => 'custom',
					'slides_to_show!' => '1',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_image',
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
				'section' => 'section_style_image',
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
			$image_html = '<img class="slick-slide-image" src="' . esc_attr( $image_url ) . '" alt="' . esc_attr( Control_Media::get_image_alt( $attachment ) ) . '" />';

			$link = $this->get_link_url( $attachment, $instance );
			if ( $link ) {
				$target = '';
				if ( ! empty( $link['is_external'] ) ) {
					$target = ' target="_blank"';
				}

				$image_html = sprintf( '<a href="%s"%s>%s</a>', $link['url'], $target, $image_html );
			}

			$slides[] = '<div><div class="slick-slide-inner">' . $image_html . '</div></div>';
		}

		if ( empty( $slides ) ) {
			return;
		}

		$is_slideshow = '1' === $instance['slides_to_show'];
		$is_rtl = ( 'rtl' === $instance['direction'] );
		$direction = $is_rtl ? 'rtl' : 'ltr';
		$show_dots = ( in_array( $instance['navigation'], [ 'dots', 'both' ] ) );
		$show_arrows = ( in_array( $instance['navigation'], [ 'arrows', 'both' ] ) );

		$slick_options = [
			'slidesToShow' => absint( $instance['slides_to_show'] ),
			'autoplaySpeed' => absint( $instance['autoplay_speed'] ),
			'autoplay' => ( 'yes' === $instance['autoplay'] ),
			'infinite' => ( 'yes' === $instance['infinite'] ),
			'pauseOnHover' => ( 'yes' === $instance['pause_on_hover'] ),
			'speed' => absint( $instance['speed'] ),
			'arrows' => $show_arrows,
			'dots' => $show_dots,
			'rtl' => $is_rtl,
		];

		$carousel_classes = [ 'elementor-image-carousel' ];

		if ( $show_arrows ) {
			$carousel_classes[] = 'slick-arrows-' . $instance['arrows_position'];
		}

		if ( $show_dots ) {
			$carousel_classes[] = 'slick-dots-' . $instance['dots_position'];
		}

		if ( 'yes' === $instance['image_stretch'] ) {
			$carousel_classes[] = 'slick-image-stretch';
		}

		if ( ! $is_slideshow ) {
			$slick_options['slidesToScroll'] = absint( $instance['slides_to_scroll'] );
		} else {
			$slick_options['fade'] = ( 'fade' === $instance['effect'] );
		}

		?>
		<div class="elementor-image-carousel-wrapper elementor-slick-slider" dir="<?php echo $direction; ?>">
			<div class="<?php echo implode( ' ', $carousel_classes ); ?>" data-slider_options='<?php echo wp_json_encode( $slick_options ); ?>'>
				<?php echo implode( '', $slides ); ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}

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

		return [
			'url' => wp_get_attachment_url( $attachment['id'] ),
		];
	}
}
//a:3:{i:0;a:5:{s:2:"id";s:7:"eohgtma";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#2a5a5b";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:4:"none";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:34:"my-class bob jerry josh mati ariel";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"nkqonpr";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:2:{i:0;a:4:{s:2:"id";s:7:"xfd1365";s:6:"elType";s:6:"widget";s:8:"settings";a:67:{s:22:"section_image_carousel";s:0:"";s:8:"carousel";a:0:{}s:14:"thumbnail_size";s:9:"thumbnail";s:26:"thumbnail_custom_dimension";a:2:{s:5:"width";s:0:"";s:6:"height";s:0:"";}s:14:"slides_to_show";s:1:"3";s:16:"slides_to_scroll";s:1:"2";s:13:"image_stretch";s:2:"no";s:10:"navigation";s:4:"both";s:7:"link_to";s:4:"none";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"view";s:11:"traditional";s:26:"section_additional_options";s:0:"";s:13:"test_switcher";b:1;s:14:"pause_on_hover";s:3:"yes";s:8:"autoplay";s:3:"yes";s:14:"autoplay_speed";i:5000;s:8:"infinite";s:3:"yes";s:6:"effect";s:5:"slide";s:5:"speed";i:500;s:9:"direction";s:3:"ltr";s:24:"section_style_navigation";s:0:"";s:20:"heading_style_arrows";s:0:"";s:15:"arrows_position";s:6:"inside";s:11:"arrows_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:12:"arrows_color";s:0:"";s:18:"heading_style_dots";s:0:"";s:13:"dots_position";s:7:"outside";s:9:"dots_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:10:"dots_color";s:0:"";s:19:"section_style_image";s:0:"";s:13:"image_spacing";s:0:"";s:20:"image_spacing_custom";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:20;}s:19:"image_border_border";s:0:"";s:18:"image_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:18:"image_border_color";s:0:"";s:19:"image_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:14:"image-carousel";}i:1;a:4:{s:2:"id";s:7:"i8rjrnj";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:12:"Never Settle";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:1;a:5:{s:2:"id";s:7:"9hn51p9";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:0:"";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:67:"http://localhost/pojo-one/wp-content/uploads/2016/09/mountain-4.jpg";s:2:"id";i:110;}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:3:"0.7";}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"22";s:5:"right";i:0;s:6:"bottom";s:2:"22";s:4:"left";i:0;s:8:"isLinked";b:0;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"199";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"au5jx0k";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"mt09nzn";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:16:"Clime to the top";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:2;a:5:{s:2:"id";s:7:"xurtyxe";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#dd9933";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:0:"";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"4gho7ok";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"2uhlohk";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:18:"Become who you are";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}}
//a:3:{i:0;a:5:{s:2:"id";s:7:"eohgtma";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#2a5a5b";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:4:"none";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:34:"my-class bob jerry josh mati ariel";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"nkqonpr";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:2:{i:0;a:4:{s:2:"id";s:7:"xfd1365";s:6:"elType";s:6:"widget";s:8:"settings";a:67:{s:22:"section_image_carousel";s:0:"";s:8:"carousel";a:0:{}s:14:"thumbnail_size";s:9:"thumbnail";s:26:"thumbnail_custom_dimension";a:2:{s:5:"width";s:0:"";s:6:"height";s:0:"";}s:14:"slides_to_show";s:1:"3";s:16:"slides_to_scroll";s:1:"2";s:13:"image_stretch";s:2:"no";s:10:"navigation";s:4:"both";s:7:"link_to";s:4:"none";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"view";s:11:"traditional";s:26:"section_additional_options";s:0:"";s:13:"test_switcher";b:0;s:14:"pause_on_hover";s:3:"yes";s:8:"autoplay";s:3:"yes";s:14:"autoplay_speed";i:5000;s:8:"infinite";s:3:"yes";s:6:"effect";s:5:"slide";s:5:"speed";i:500;s:9:"direction";s:3:"ltr";s:24:"section_style_navigation";s:0:"";s:20:"heading_style_arrows";s:0:"";s:15:"arrows_position";s:6:"inside";s:11:"arrows_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:12:"arrows_color";s:0:"";s:18:"heading_style_dots";s:0:"";s:13:"dots_position";s:7:"outside";s:9:"dots_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:10:"dots_color";s:0:"";s:19:"section_style_image";s:0:"";s:13:"image_spacing";s:0:"";s:20:"image_spacing_custom";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:20;}s:19:"image_border_border";s:0:"";s:18:"image_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:18:"image_border_color";s:0:"";s:19:"image_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:14:"image-carousel";}i:1;a:4:{s:2:"id";s:7:"i8rjrnj";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:12:"Never Settle";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:1;a:5:{s:2:"id";s:7:"9hn51p9";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:0:"";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:67:"http://localhost/pojo-one/wp-content/uploads/2016/09/mountain-4.jpg";s:2:"id";i:110;}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:3:"0.7";}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"22";s:5:"right";i:0;s:6:"bottom";s:2:"22";s:4:"left";i:0;s:8:"isLinked";b:0;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"199";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"au5jx0k";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"mt09nzn";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:16:"Clime to the top";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:2;a:5:{s:2:"id";s:7:"xurtyxe";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#dd9933";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:0:"";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"4gho7ok";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"2uhlohk";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:18:"Become who you are";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}}
//a:3:{i:0;a:5:{s:2:"id";s:7:"eohgtma";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#2a5a5b";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:4:"none";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:34:"my-class bob jerry josh mati ariel";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"nkqonpr";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:2:{i:0;a:4:{s:2:"id";s:7:"xfd1365";s:6:"elType";s:6:"widget";s:8:"settings";a:67:{s:22:"section_image_carousel";s:0:"";s:8:"carousel";a:0:{}s:14:"thumbnail_size";s:9:"thumbnail";s:26:"thumbnail_custom_dimension";a:2:{s:5:"width";s:0:"";s:6:"height";s:0:"";}s:14:"slides_to_show";s:1:"3";s:16:"slides_to_scroll";s:1:"2";s:13:"image_stretch";s:2:"no";s:10:"navigation";s:4:"both";s:7:"link_to";s:4:"none";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"view";s:11:"traditional";s:26:"section_additional_options";s:0:"";s:13:"test_switcher";s:4:"show";s:14:"pause_on_hover";s:3:"yes";s:8:"autoplay";s:3:"yes";s:14:"autoplay_speed";i:5000;s:8:"infinite";s:3:"yes";s:6:"effect";s:5:"slide";s:5:"speed";i:500;s:9:"direction";s:3:"ltr";s:24:"section_style_navigation";s:0:"";s:20:"heading_style_arrows";s:0:"";s:15:"arrows_position";s:6:"inside";s:11:"arrows_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:12:"arrows_color";s:0:"";s:18:"heading_style_dots";s:0:"";s:13:"dots_position";s:7:"outside";s:9:"dots_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:10:"dots_color";s:0:"";s:19:"section_style_image";s:0:"";s:13:"image_spacing";s:0:"";s:20:"image_spacing_custom";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:20;}s:19:"image_border_border";s:0:"";s:18:"image_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:18:"image_border_color";s:0:"";s:19:"image_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:14:"image-carousel";}i:1;a:4:{s:2:"id";s:7:"i8rjrnj";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:12:"Never Settle";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:1;a:5:{s:2:"id";s:7:"9hn51p9";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:0:"";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:67:"http://localhost/pojo-one/wp-content/uploads/2016/09/mountain-4.jpg";s:2:"id";i:110;}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:3:"0.7";}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"22";s:5:"right";i:0;s:6:"bottom";s:2:"22";s:4:"left";i:0;s:8:"isLinked";b:0;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"199";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:26:"elementor-force-full-width";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"au5jx0k";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"mt09nzn";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:16:"Clime to the top";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}i:2;a:5:{s:2:"id";s:7:"xurtyxe";s:6:"elType";s:7:"section";s:8:"settings";a:65:{s:14:"section_layout";s:0:"";s:6:"layout";s:5:"boxed";s:13:"content_width";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:3:"gap";s:7:"default";s:6:"height";s:7:"default";s:13:"custom_height";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:400;}s:15:"column_position";s:6:"middle";s:16:"content_position";s:0:"";s:9:"structure";s:2:"10";s:18:"section_background";s:0:"";s:21:"background_background";s:7:"classic";s:16:"background_color";s:7:"#dd9933";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.29999999999999999;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:24:"background_overlay_title";s:0:"";s:29:"background_overlay_background";s:7:"classic";s:24:"background_overlay_color";s:7:"#a57a48";s:24:"background_overlay_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:27:"background_overlay_position";s:0:"";s:29:"background_overlay_attachment";s:0:"";s:25:"background_overlay_repeat";s:0:"";s:23:"background_overlay_size";s:0:"";s:33:"background_overlay_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:33:"background_overlay_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:29:"background_overlay_video_link";s:0:"";s:33:"background_overlay_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"background_overlay_opacity";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:14:"section_border";s:0:"";s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:3:"200";s:5:"right";s:1:"0";s:6:"bottom";s:3:"200";s:4:"left";s:1:"0";s:8:"isLinked";b:0;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:19:"_section_responsive";s:0:"";s:20:"reverse_order_mobile";s:0:"";s:18:"heading_visibility";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";s:16:"force_full_width";s:0:"";}s:8:"elements";a:1:{i:0;a:5:{s:2:"id";s:7:"4gho7ok";s:6:"elType";s:6:"column";s:8:"settings";a:41:{s:12:"_inline_size";N;s:12:"_column_size";i:100;s:13:"section_style";s:0:"";s:21:"background_background";s:4:"none";s:16:"background_color";s:16:"rgba(0,0,0,0.39)";s:16:"background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:19:"background_position";s:0:"";s:21:"background_attachment";s:0:"";s:17:"background_repeat";s:0:"";s:15:"background_size";s:0:"";s:25:"background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:25:"background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:21:"background_video_link";s:0:"";s:25:"background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:13:"border_border";s:0:"";s:12:"border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:12:"border_color";s:0:"";s:13:"border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:2:"10";s:5:"right";s:2:"10";s:6:"bottom";s:2:"10";s:4:"left";s:2:"10";s:8:"isLinked";b:1;}s:26:"box_shadow_box_shadow_type";s:0:"";s:21:"box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:12:"section_typo";s:0:"";s:10:"color_text";s:0:"";s:13:"heading_color";s:0:"";s:10:"color_link";s:0:"";s:16:"color_link_hover";s:0:"";s:10:"text_align";s:0:"";s:16:"section_advanced";s:0:"";s:6:"margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:7:"padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:9:"animation";s:0:"";s:18:"animation_duration";s:0:"";s:11:"css_classes";s:0:"";s:18:"section_responsive";s:0:"";s:9:"screen_sm";s:7:"default";s:15:"screen_sm_width";s:3:"100";s:9:"screen_xs";s:7:"default";s:15:"screen_xs_width";s:3:"100";}s:8:"elements";a:1:{i:0;a:4:{s:2:"id";s:7:"2uhlohk";s:6:"elType";s:6:"widget";s:8:"settings";a:58:{s:13:"section_title";s:0:"";s:5:"title";s:18:"Become who you are";s:4:"link";a:2:{s:11:"is_external";s:0:"";s:3:"url";s:0:"";}s:4:"size";s:5:"large";s:11:"header_size";s:2:"h2";s:5:"align";s:6:"center";s:12:"align_tablet";s:0:"";s:12:"align_mobile";s:0:"";s:4:"view";s:11:"traditional";s:19:"section_title_style";s:0:"";s:11:"title_color";s:7:"#ffffff";s:21:"typography_typography";s:6:"custom";s:20:"typography_font_size";a:2:{s:4:"unit";s:2:"px";s:4:"size";i:61;}s:27:"typography_font_size_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:27:"typography_font_size_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:22:"typography_font_family";s:7:"Raleway";s:22:"typography_font_weight";s:0:"";s:25:"typography_text_transform";s:9:"uppercase";s:21:"typography_font_style";s:0:"";s:22:"typography_line_height";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_tablet";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:29:"typography_line_height_mobile";a:2:{s:4:"unit";s:2:"em";s:4:"size";s:0:"";}s:25:"typography_letter_spacing";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_tablet";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:32:"typography_letter_spacing_mobile";a:2:{s:4:"unit";s:2:"px";s:4:"size";s:0:"";}s:14:"_section_style";s:0:"";s:7:"_margin";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:14:"_margin_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:8:"_padding";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_tablet";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:15:"_padding_mobile";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:10:"_animation";s:0:"";s:18:"animation_duration";s:0:"";s:12:"_css_classes";s:0:"";s:19:"_section_background";s:0:"";s:22:"_background_background";s:0:"";s:17:"_background_color";s:0:"";s:17:"_background_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:20:"_background_position";s:0:"";s:22:"_background_attachment";s:0:"";s:18:"_background_repeat";s:0:"";s:16:"_background_size";s:0:"";s:26:"_background_parallax_image";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:26:"_background_parallax_speed";a:2:{s:4:"unit";s:2:"px";s:4:"size";d:0.5;}s:22:"_background_video_link";s:0:"";s:26:"_background_video_fallback";a:2:{s:3:"url";s:0:"";s:2:"id";s:0:"";}s:14:"_border_border";s:0:"";s:13:"_border_width";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:13:"_border_color";s:0:"";s:14:"_border_radius";a:6:{s:4:"unit";s:2:"px";s:3:"top";s:0:"";s:5:"right";s:0:"";s:6:"bottom";s:0:"";s:4:"left";s:0:"";s:8:"isLinked";b:1;}s:27:"_box_shadow_box_shadow_type";s:0:"";s:22:"_box_shadow_box_shadow";a:6:{s:10:"horizontal";i:0;s:8:"vertical";i:0;s:4:"blur";i:10;s:6:"spread";i:0;s:5:"inset";s:0:"";s:5:"color";s:15:"rgba(0,0,0,0.5)";}s:19:"_section_responsive";s:0:"";s:22:"responsive_description";s:0:"";s:12:"hide_desktop";s:0:"";s:11:"hide_tablet";s:0:"";s:11:"hide_mobile";s:0:"";}s:10:"widgetType";s:7:"heading";}}s:7:"isInner";b:0;}}s:7:"isInner";b:0;}}