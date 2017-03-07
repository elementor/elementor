<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image_Box extends Widget_Base {

	public function get_name() {
		return 'image-box';
	}

	public function get_title() {
		return __( 'Image Box', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-image-box';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_image',
			[
				'label' => __( 'Image Box', 'elementor' ),
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

		$this->add_control(
			'title_text',
			[
				'label' => __( 'Title & Description', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'This is the heading', 'elementor' ),
				'placeholder' => __( 'Your Title', 'elementor' ),
				'label_block' => true,
			]
		);

		$this->add_control(
			'description_text',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'default' => __( 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
				'placeholder' => __( 'Your Description', 'elementor' ),
				'title' => __( 'Input image text here', 'elementor' ),
				'separator' => 'none',
				'rows' => 10,
				'show_label' => false,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'separator' => 'before',
			]
		);

		$this->add_control(
			'position',
			[
				'label' => __( 'Image Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'top',
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'top' => [
						'title' => __( 'Top', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
				],
				'prefix_class' => 'elementor-position-',
				'toggle' => false,
			]
		);

		$this->add_control(
			'title_size',
			[
				'label' => __( 'Title HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'h1' => __( 'H1', 'elementor' ),
					'h2' => __( 'H2', 'elementor' ),
					'h3' => __( 'H3', 'elementor' ),
					'h4' => __( 'H4', 'elementor' ),
					'h5' => __( 'H5', 'elementor' ),
					'h6' => __( 'H6', 'elementor' ),
					'div' => __( 'div', 'elementor' ),
					'span' => __( 'span', 'elementor' ),
					'p' => __( 'p', 'elementor' ),
				],
				'default' => 'h3',
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
			'image_space',
			[
				'label' => __( 'Image Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 15,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}}.elementor-position-right .elementor-image-box-img' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-left .elementor-image-box-img' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-top .elementor-image-box-img' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'image_size',
			[
				'label' => __( 'Image Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 30,
					'unit' => '%',
				],
				'size_units' => [ '%' ],
				'range' => [
					'%' => [
						'min' => 5,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper .elementor-image-box-img' => 'width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'image_opacity',
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
					'{{WRAPPER}} .elementor-image-box-wrapper .elementor-image-box-img img' => 'opacity: {{SIZE}};',
				],
			]
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => __( 'Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'text_align',
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
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'content_vertical_alignment',
			[
				'label' => __( 'Vertical Alignment', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'top' => __( 'Top', 'elementor' ),
					'middle' => __( 'Middle', 'elementor' ),
					'bottom' => __( 'Bottom', 'elementor' ),
				],
				'default' => 'top',
				'prefix_class' => 'elementor-vertical-align-',
			]
		);

		$this->add_control(
			'heading_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_responsive_control(
			'title_bottom_space',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-content .elementor-image-box-title' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-content .elementor-image-box-title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
			]
		);

		$this->add_control(
			'heading_description',
			[
				'label' => __( 'Description', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'description_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-content .elementor-image-box-description' => 'color: {{VALUE}};',
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
				'name' => 'description_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-content .elementor-image-box-description',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings();

		$has_content = ! empty( $settings['title_text'] ) || ! empty( $settings['description_text'] );

		$html = '<div class="elementor-image-box-wrapper">';

		if ( ! empty( $settings['image']['url'] ) ) {
			$this->add_render_attribute( 'image', 'src', $settings['image']['url'] );
			$this->add_render_attribute( 'image', 'alt', Control_Media::get_image_alt( $settings['image'] ) );
			$this->add_render_attribute( 'image', 'title', Control_Media::get_image_title( $settings['image'] ) );

			if ( $settings['hover_animation'] ) {
				$this->add_render_attribute( 'image', 'class', 'elementor-animation-' . $settings['hover_animation'] );
			}

			$image_html = '<img ' . $this->get_render_attribute_string( 'image' ) . '>';

			if ( ! empty( $settings['link']['url'] ) ) {
				$target = '';
				if ( ! empty( $settings['link']['is_external'] ) ) {
					$target = ' target="_blank"';
				}
				$image_html = sprintf( '<a href="%s"%s>%s</a>', $settings['link']['url'], $target, $image_html );
			}

			$html .= '<figure class="elementor-image-box-img">' . $image_html . '</figure>';
		}

		if ( $has_content ) {
			$html .= '<div class="elementor-image-box-content">';

			if ( ! empty( $settings['title_text'] ) ) {
				$title_html = $settings['title_text'];

				if ( ! empty( $settings['link']['url'] ) ) {
					$target = '';

					if ( ! empty( $settings['link']['is_external'] ) ) {
						$target = ' target="_blank"';
					}

					$title_html = sprintf( '<a href="%s"%s>%s</a>', $settings['link']['url'], $target, $title_html );
				}

				$html .= sprintf( '<%1$s class="elementor-image-box-title">%2$s</%1$s>', $settings['title_size'], $title_html );
			}

			if ( ! empty( $settings['description_text'] ) ) {
				$html .= sprintf( '<p class="elementor-image-box-description">%s</p>', $settings['description_text'] );
			}

			$html .= '</div>';
		}

		$html .= '</div>';

		echo $html;
	}

	protected function _content_template() {
		?>
		<#
		var html = '<div class="elementor-image-box-wrapper">';

		if ( settings.image.url ) {
			var imageHtml = '<img src="' + settings.image.url + '" class="elementor-animation-' + settings.hover_animation + '" />';

			if ( settings.link.url ) {
				imageHtml = '<a href="' + settings.link.url + '">' + imageHtml + '</a>';
			}

			html += '<figure class="elementor-image-box-img">' + imageHtml + '</figure>';
		}

		var hasContent = !! ( settings.title_text || settings.description_text );

		if ( hasContent ) {
			html += '<div class="elementor-image-box-content">';

			if ( settings.title_text ) {
				var title_html = settings.title_text;

				if ( settings.link.url ) {
					title_html = '<a href="' + settings.link.url + '">' + title_html + '</a>';
				}

				html += '<' + settings.title_size  + ' class="elementor-image-box-title">' + title_html + '</' + settings.title_size  + '>';
			}

			if ( settings.description_text ) {
				html += '<p class="elementor-image-box-description">' + settings.description_text + '</p>';
			}

			html += '</div>';
		}

		html += '</div>';

		print( html );
		#>
		<?php
	}
}
