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
				'label' => __( 'Image Box', 'elementor' ),
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
			'title_text',
			[
				'label' => __( 'Title & Description', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'This is the heading', 'elementor' ),
				'placeholder' => __( 'Your Title', 'elementor' ),
				'section' => 'section_image',
				'label_block' => true,
			]
		);

		$this->add_control(
			'description_text',
			[
				'label' => '',
				'type' => Controls_Manager::TEXTAREA,
				'default' => __( 'Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
				'placeholder' => __( 'Your Description', 'elementor' ),
				'title' => __( 'Input image text here', 'elementor' ),
				'section' => 'section_image',
				'label_block' => true,
				'rows' => 10,
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
			'position',
			[
				'label' => __( 'Image Postion', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'elementor-position-top',
				'options' => [
					'elementor-position-left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'elementor-position-top' => [
						'title' => __( 'Top', 'elementor' ),
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
				'label' => __( 'Image Alt Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => __( 'Enter your alternative text', 'elementor' ),
				'default' => __( 'Sample Image', 'elementor' ),
				'title' => __( 'Input an alternative text when the image can\'t to be displayed', 'elementor' ),
				'section' => 'section_image',
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
				'section' => 'section_image',
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
			'section_style_image',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Image', 'elementor' ),
				'tab'   => self::TAB_STYLE,
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
				'section' => 'section_style_image',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-right .elementor-image-box-img figure' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-left .elementor-image-box-img figure' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-top .elementor-image-box-img figure' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'image_size',
			[
				'label' => __( 'Image Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 100,
					'unit' => '%',
				],
				'size_units' => [ '%' ],
				'range' => [
					'%' => [
						'min' => 5,
						'max' => 100,
					],
				],
				'section' => 'section_style_image',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-right .elementor-image-box-img' => 'max-width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-left .elementor-image-box-img' => 'max-width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-image-box-wrapper.elementor-position-top .elementor-image-box-img img' => 'max-width: {{SIZE}}{{UNIT}};',
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
				'section' => 'section_style_image',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper' => 'opacity: {{SIZE}};',
				],
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
					'block' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'align-justify',
					],
				],
				'section' => 'section_style_content',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-wrapper .elementor-image-box-content' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'heading_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'section' => 'section_style_content',
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Title Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-content .elementor-image-box-title' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-content .elementor-image-box-title',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
			]
		);

		$this->add_control(
			'heading_description',
			[
				'label' => __( 'Description', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'section' => 'section_style_content',
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'description_color',
			[
				'label' => __( 'Description Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-image-box-content .elementor-image-box-description' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'description_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-content .elementor-image-box-description',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
			]
		);
	}

	protected function render( $instance = [] ) {
		$has_content = ! empty( $instance['title_text'] ) || ! empty( $instance['description_text'] );

		$image_html = sprintf( '<div class="elementor-image-box-wrapper %s">', $instance['position'] );

		if ( ! empty( $instance['image']['url'] ) ) {
			$image_html .= sprintf( '<div class="elementor-image-box-img"><figure><img src="%s" alt="%s" /></figure></div>', esc_attr( $instance['image']['url'] ), esc_attr( $instance['alt_text'] ) );
		}

		if ( ! empty( $instance['link']['url'] ) ) {
			$target = '';
			if ( ! empty( $instance['link']['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$image_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $image_html );
		}

		if ( $has_content ) {
			$image_html .= '<div class="elementor-image-box-content">';

			if ( ! empty( $instance['title_text'] ) ) {
				$image_html .= sprintf( '<%1$s class="elementor-image-box-title">%2$s</%1$s>', $instance['title_size'], $instance['title_text'] );
			}

			if ( ! empty( $instance['description_text'] ) ) {
				$image_html .= sprintf( '<p class="elementor-image-box-description">%s</p>', $instance['description_text'] );
			}

			$image_html .= '</div>';
		}
		$image_html .= '</div>';

		echo $image_html;
	}

	protected function content_template() {
		?>
		<%
	    var image_html = '<div class="elementor-image-box-wrapper ' + settings.position + '">';
		if ( '' !== settings.image.url ) {
			image_html += '<div class="elementor-image-box-img"><figure><img src="' + settings.image.url + '" alt="' + settings.alt_text + '" /></figure></div>';
		}

		if ( settings.link.url ) {
			var link = settings.link;
			image_html = '<a href="' + link.url + '">' + image_html + '</a>';
		}
			
		var hasContent = '' !== settings.title_text || '' !== settings.description_text;
		if ( hasContent ) {
			image_html += '<div class="elementor-image-box-content">';

			if ( '' !== settings.title_text ) {
				image_html += '<' + settings.title_size  + ' class="elementor-image-box-title">' + settings.title_text + '</' + settings.title_size  + '>';
			}
			
			if ( '' !== settings.description_text ) {
				image_html += '<p class="elementor-image-box-description">' + settings.description_text + '</p>';
			}
	
			image_html += '</div>';
		}
		image_html += '</div>';

		print( image_html );
		%>
		<?php
	}
}
