<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image extends Widget_Base {

	public function get_name() {
		return 'image';
	}

	public function get_title() {
		return __( 'Image', 'elementor' );
	}

	public function get_icon() {
		return 'insert-image';
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_image',
			[
				'label' => __( 'Image', 'elementor' ),
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
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name' => 'image', // Actually its `image_size`
				'label' => __( 'Image Size', 'elementor' ),
				'default' => 'large',
			]
		);

		$this->add_responsive_control(
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
			]
		);

		$this->add_control(
			'link_to',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'none',
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
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
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
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'space',
			[
				'label' => __( 'Size (%)', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
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
			'hover_animation',
			[
				'label' => __( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'label' => __( 'Image Border', 'elementor' ),
				'selector' => '{{WRAPPER}} .elementor-image img',
			]
		);

		$this->add_control(
			'image_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'image_box_shadow',
				'selector' => '{{WRAPPER}} .elementor-image img',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_caption',
			[
				'label' => __( 'Caption', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
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
					'{{WRAPPER}} .widget-image-caption' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .widget-image-caption' => 'color: {{VALUE}};',
				],
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
				'selector' => '{{WRAPPER}} .widget-image-caption',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings();

		if ( empty( $settings['image']['url'] ) ) {
			return;
		}
		$has_caption = ! empty( $settings['caption'] );

		$image_html = '<div class="elementor-image' . ( ! empty( $settings['shape'] ) ? ' elementor-image-shape-' . $settings['shape'] : '' ) . '">';

		if ( $has_caption ) {
			$image_html .= '<figure class="wp-caption">';
		}

		$image_html .= Group_Control_Image_Size::get_attachment_image_html( $settings );

		$link = $this->get_link_url( $settings );
		if ( $link ) {
			$target = '';
			if ( ! empty( $link['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$image_html = sprintf( '<a href="%s"%s>%s</a>', $link['url'], $target, $image_html );
		}

		if ( $has_caption ) {
			$image_html .= sprintf( '<figcaption class="widget-image-caption wp-caption-text">%s</figcaption>', $settings['caption'] );
		}

		if ( $has_caption ) {
			$image_html .= '</figure>';
		}
		$image_html .= '</div>';

		echo $image_html;
	}

	protected function _content_template() {
		?>
		<# if ( '' !== settings.image.url ) {

			elementor.imagesManager.registerItem( elementModel );

			// Get url from imagesManager.
			var image_url = elementor.imagesManager.getItem( elementModel );

			// If it's not in cache, like a new dropped widget or a custom size - get from settings
			if ( ! image_url ) {

			if ( 'custom' === settings.image_size ) {
			return;
			}

			// If it's a new dropped widget
			image_url = settings.image.url;
			}

			#>
			<div class="elementor-image{{ settings.shape ? ' elementor-image-shape-' + settings.shape : '' }}">
				<#
					var imgClass = '', image_html = '',
					hasCaption = '' !== settings.caption,
					image_html = '';

					if ( '' !== settings.hover_animation ) {
					imgClass = 'elementor-animation-' + settings.hover_animation;
					}

					if ( hasCaption ) {
					image_html += '<figure class="wp-caption">';
				}

				image_html += '<img src="' + image_url + '" class="' + imgClass + '" />';

				var link_url;
				if ( 'custom' === settings.link_to ) {
				link_url = settings.link.url;
				}

				if ( 'file' === settings.link_to ) {
				link_url = settings.image.url;
				}

				if ( link_url ) {
				image_html = '<a href="' + link_url + '">' + image_html + '</a>';
				}

				if ( hasCaption ) {
				image_html += '<figcaption class="widget-image-caption wp-caption-text">' + settings.caption + '</figcaption>';
				}

				if ( hasCaption ) {
				image_html += '</figure>';
				}

				print( image_html );

				#>
			</div>
			<# } #>
		<?php
	}

	private function get_link_url( $instance ) {
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
			'url' => $instance['image']['url'],
		];
	}
}
