<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Heading extends Widget_Base {

	public function get_id() {
		return 'heading';
	}

	public function get_title() {
		return __( 'Heading', 'elementor' );
	}

	public function get_icon() {
		return 'type-tool';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'placeholder' => __( 'Enter your title', 'elementor' ),
				'default' => __( 'This is heading element', 'elementor' ),
				'section' => 'section_title',
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => 'http://your-link.com',
				'default' => [
					'url' => '',
				],
				'section' => 'section_title',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'large',
				'options' => [
					'small' => __( 'Small', 'elementor' ),
					'medium' => __( 'Medium', 'elementor' ),
					'large' => __( 'Large', 'elementor' ),
					'xl' => __( 'XL', 'elementor' ),
					'xxl' => __( 'XXL', 'elementor' ),
				],
				'section' => 'section_title',
			]
		);

		$this->add_control(
			'header_size',
			[
				'label' => __( 'HTML Tag', 'elementor' ),
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
				'default' => 'h2',
				'section' => 'section_title',
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
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'align-justify',
					],
				],
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}};',
				],
				'section' => 'section_title',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_title',
			]
		);

		$this->add_control(
			'section_title_style',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
				    'type' => Scheme_Color::get_type(),
				    'value' => Scheme_Color::COLOR_1,
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_title_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-heading-title' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'tab' => self::TAB_STYLE,
				'section' => 'section_title_style',
				'selector' => '{{WRAPPER}} .elementor-heading-title',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['title'] ) )
			return;

		$this->add_render_attribute( 'heading', 'class', 'elementor-heading-title' );

		if ( ! empty( $instance['size'] ) ) {
			$this->add_render_attribute( 'heading', 'class', 'elementor-size-' . $instance['size'] );
		}

		if ( ! empty( $instance['link']['url'] ) ) {
			$url = sprintf( '<a href="%s">%s</a>', $instance['link']['url'], $instance['title'] );
			$title_html = sprintf( '<%1$s %2$s>%3$s</%1$s>', $instance['header_size'], $this->get_render_attribute_string( 'heading' ), $url );
		} else {
			$title_html = sprintf( '<%1$s %2$s>%3$s</%1$s>', $instance['header_size'], $this->get_render_attribute_string( 'heading' ), $instance['title'] );
		}

		echo $title_html;
	}

	protected function content_template() {
		?>
		<%
		if ( '' !== settings.title ) {
			var title_html = '<' + settings.header_size  + ' class="elementor-heading-title elementor-size-' + settings.size + '">' + settings.title + '</' + settings.header_size + '>';
		}
		
		if ( '' !== settings.link.url ) {
			var title_html = '<' + settings.header_size  + ' class="elementor-heading-title elementor-size-' + settings.size + '"><a href="' + settings.link.url + '">' + title_html + '</a></' + settings.header_size + '>';
		}

		print( title_html );
		%>
		<?php
	}
}
