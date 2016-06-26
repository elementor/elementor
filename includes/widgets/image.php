<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image extends Widget_Base {

	public function get_id() {
		return 'image';
	}

	public function get_title() {
		return __( 'Image', 'elementor' );
	}

	public function get_icon() {
		return 'insert-image';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'image',
			[
				'label' => __( 'Choose Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
					],
				],
				'default' => 'center',
				'section' => 'section_image',
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'caption',
			[
				'label' => __( 'Caption', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => __( 'Enter your caption about the image', 'elementor' ),
				'title' => __( 'Input image caption here', 'elementor' ),
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'section' => 'section_image',
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

		/*$this->add_control(
			'shape',
			[
				'label' => __( 'Image Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'circle' => __( 'Circle', 'elementor' ),
				],
				'default' => '',
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => __( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => __( 'None', 'elementor' ),
					'grow' => __( 'Grow', 'elementor' ),
					'shrink' => __( 'Shrink', 'elementor' ),
					'pulse-grow' => __( 'Pulse Grow', 'elementor' ),
					'pulse-shrink' => __( 'Pulse Shrink', 'elementor' ),
					'push' => __( 'Push', 'elementor' ),
					'pop' => __( 'Pop', 'elementor' ),
					'rotate' => __( 'Rotate', 'elementor' ),
					'grow-rotate' => __( 'Grow Rotate', 'elementor' ),
					'float' => __( 'Float', 'elementor' ),
					'sink' => __( 'Sink', 'elementor' ),
					'hover' => __( 'Hover', 'elementor' ),
					'wobble-vertical' => __( 'Wobble Vertical', 'elementor' ),
					'wobble-horizontal' => __( 'Wobble Horizontal', 'elementor' ),
					'buzz' => __( 'Buzz', 'elementor' ),
				],
				'default' => '',
				'tab' => self::TAB_STYLE,
			]
		);*/

		$this->add_control(
			'section_style_image',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Image', 'elementor' ),
				'tab'   => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'space',
			[
				'label' => __( 'Size (%)', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_image',
				'default' => [
					'size' => 100,
					'unit' => '%',
				],
				'size_units' => [ '%' ],
				'range' => [
					'%' => [
						'min' => 1,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image img' => 'max-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'opacity',
			[
				'label' => __( 'Opacity (%)', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_image',
				'default' => [
					'size' => 1,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'min' => 0.10,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image img' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->add_control(
			'section_style_caption',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Caption', 'elementor' ),
				'tab'   => self::TAB_STYLE,
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
						'icon' => 'align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'align-justify',
					],
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .widget-image-text' => 'text-align: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_caption',
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .widget-image-text' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_caption',
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'caption_typography',
				'selector' => '{{WRAPPER}} .widget-image-text',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_caption',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['image']['url'] ) ) {
			return;
		}
		$image_html = '<div class="elementor-image' . ( ! empty( $instance['shape'] ) ? ' elementor-image-shape-' . $instance['shape'] : '' ) . '">';

		$image_class_html = ! empty( $instance['hover_animation'] ) ? ' class="hover-' . $instance['hover_animation'] . '"' : '';

		$image_html .= sprintf( '<img src="%s" title="%s" alt="%s"%s />', esc_attr( $instance['image']['url'] ), $this->get_image_title( $instance ), $this->get_image_alt( $instance ), $image_class_html );

		if ( ! empty( $instance['link']['url'] ) ) {
			$target = '';
			if ( ! empty( $instance['link']['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$image_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $image_html );
		}

		if ( ! empty( $instance['caption'] ) ) {
			$image_html .= sprintf( '<p class="widget-image-text">%s</p>', $instance['caption'] );
		}
		$image_html .= '</div>';

		echo $image_html;
	}

	protected function content_template() {
		?>
		<% if ( '' !== settings.image.url ) { %>
			<div class="elementor-image<%= settings.shape ? ' elementor-image-shape-' + settings.shape : '' %>">
				<%
				var imgClass = '', image_html = '';
				if ( '' !== settings.hover_animation ) {
					imgClass = 'hover-' + settings.hover_animation;
				}

				image_html = '<img src="' + settings.image.url + '" class="' + imgClass + '" />';

				if ( settings.link ) {
					var link = settings.link;
					image_html = '<a href="' + link.url + '">' + image_html + '</a>';
				}

				if ( '' !== settings.caption ) {
					image_html += '<p class="widget-image-text">' + settings.caption + '</p>';
				}

				print( image_html );
				%>
			</div>
		<% } %>
		<?php
	}

	private function get_image_alt( $instance ) {
		$post_id = $instance['image']['id'];

		if ( ! $post_id ) {
			return false;
		}

		$alt = get_post_meta( $post_id, '_wp_attachment_image_alt', true );
		if ( ! $alt ) {
			$attachment = get_post( $post_id );
			$alt = $attachment->post_excerpt;
			if ( ! $alt ) {
				$alt = $attachment->post_title;
			}
		}
		return trim( strip_tags( $alt ) );
	}

	private function get_image_title( $instance ) {
		$post_id = $instance['image']['id'];

		if ( ! $post_id ) {
			return false;
		}

		$attachment = get_post( $post_id );
		return trim( strip_tags( $attachment->post_title ) );
	}
}
