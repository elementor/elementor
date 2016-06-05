<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Image_box extends Widget_Base {

	public function get_id() {
		return 'image-box';
	}

	public function get_title() {
		return __( 'Image Box', 'elementor' );
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
			'image_size',
			[
				'label' => __( 'Image Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 150,
				],
				'range' => [
					'px' => [
						'min' => 10,
						'max' => 1000,
					],
				],
				'section' => 'section_image',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box img' => 'width: {{SIZE}}{{UNIT}};',
				],
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
						'max' => 1000,
					],
				],
				'section' => 'section_image',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper .widget-image-text.elementor-position-right' => 'padding-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-image-box-wrapper .widget-image-text.elementor-position-left' => 'padding-left: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'position',
			[
				'label' => __( 'Image Postion', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'elementor-position-left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'elementor-position-center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'align-center',
					],
					'elementor-position-right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
					],
				],
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'alt_text',
			[
				'label' => __( 'Alt Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'Enter your alternative text', 'elementor' ),
				'default' => __( 'Sample Image', 'elementor' ),
				'title' => __( 'Input an alternative text when the image can\'t to be displayed', 'elementor' ),
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
			'section_content',
			[
				'label' => __( 'Content', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => __( 'Enter your title text', 'elementor' ),
				'section' => 'section_content',
				'label_block' => true,
			]
		);

		$this->add_control(
			'text',
			[
				'label' => __( 'Text', 'elementor' ),
				'type' => Controls_Manager::WYSIWYG,
				'default' => '',
				'placeholder' => __( 'Enter your text about the image', 'elementor' ),
				'title' => __( 'Input image text here', 'elementor' ),
				'section' => 'section_content',
				'label_block' => true,
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_content',
			]
		);

		$this->add_control(
			'section_style_content',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Content', 'elementor' ),
				'tab'   => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'text_align',
			[
				'label' => __( 'Text Align', 'elementor' ),
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
				'section' => 'section_style_content',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper .widget-image-text' => 'text-align: {{VALUE}};',
				],
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
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .widget-image-text h3',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['image']['url'] ) ) {
			return;
		}
		$image_html = '<div class="elementor-image-box-wrapper' . ( ! empty( $instance['shape'] ) ? ' elementor-image-shape-' . $instance['shape'] : '' ) . '">';

		$image_html .= sprintf( '<div class="elementor-image-box %s"><figure><img src="%s" alt="%s" /></figure></div>', esc_attr( $instance['position'] ), esc_attr( $instance['image']['url'] ), esc_attr( $instance['alt_text'] ) );

		if ( ! empty( $instance['link']['url'] ) ) {
			$target = '';
			if ( ! empty( $instance['link']['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$image_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $image_html );
		}

		if ( ! empty( $instance['title'] ) ) {
			$image_html .= sprintf( '<div class="widget-image-text %s"><h3>%s</h3>', $instance['position'], $instance['title'] );
		}

		if ( ! empty( $instance['text'] ) ) {
			$image_html .= sprintf( '%s', $instance['text'] );
		}

		$image_html .= '</div></div>';

		echo $image_html;
	}

	protected function content_template() {
		?>
		<% if ( '' !== settings.image.url ) { %>
		<div class="elementor-image-box-wrapper">
			<%
			image_html = '<div class="elementor-image-box ' + settings.position + '"><figure><img src="' + settings.image.url + '" alt="' + settings.alt_text + '" /></figure></div>';
	
			if ( settings.link.url ) {
				var link = settings.link;
				image_html = '<a href="' + link.url + '">' + image_html + '</a>';
			}

			if ( '' !== settings.title ) {
			image_html += '<div class="widget-image-text ' + settings.position + '"><h3>' + settings.title + '</h3>';
			}
			
			if ( '' !== settings.text ) {
				image_html += settings.text;
			}

			image_html += '</div></div>';

			print( image_html );
			%>
		<% } %>
		<?php
	}
}
