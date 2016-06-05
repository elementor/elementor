<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Icon_box extends Widget_Base {

	public function get_id() {
		return 'icon-box';
	}

	public function get_title() {
		return __( 'Icon Box', 'elementor' );
	}

	public function get_icon() {
		return 'favorite';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_icon',
			[
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => __( 'Choose Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'section' => 'section_icon',
			]
		);

		$this->add_control(
			'icon_size',
			[
				'label' => __( 'Icon Size', 'elementor' ),
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
				'section' => 'section_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-box i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_space',
			[
				'label' => __( 'Icon Spacing', 'elementor' ),
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
				'section' => 'section_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-box-wrapper .widget-icon-text.elementor-position-right' => 'padding-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-icon-box-wrapper .widget-icon-text.elementor-position-left' => 'padding-left: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'position',
			[
				'label' => __( 'Icon Position', 'elementor' ),
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
				'section' => 'section_icon',
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'section' => 'section_icon',
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
				'placeholder' => __( 'Enter your text about the icon', 'elementor' ),
				'title' => __( 'Input icon text here', 'elementor' ),
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
				'section' => 'section_icon',
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
					'{{WRAPPER}} .elementor-icon-box-wrapper .widget-icon-text' => 'text-align: {{VALUE}};',
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
					'{{WRAPPER}} .widget-icon-text' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .widget-icon-text h3',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['icon'] ) ) {
			return;
		}
		$icon_html = '<div class="elementor-icon-box-wrapper' . ( ! empty( $instance['shape'] ) ? ' elementor-icon-shape-' . $instance['shape'] : '' ) . '">';

		$icon_html .= sprintf( '<div class="elementor-icon-box %s"><i class="%s" aria-hidden="%s"></i></div>', esc_attr( $instance['position'] ), esc_attr( $instance['icon'] ), esc_attr( $instance['alt_text'] ) );

		if ( ! empty( $instance['link']['url'] ) ) {
			$target = '';
			if ( ! empty( $instance['link']['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$icon_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $icon_html );
		}

		if ( ! empty( $instance['title'] ) ) {
			$icon_html .= sprintf( '<div class="widget-icon-text %s"><h3>%s</h3>', $instance['position'], $instance['title'] );
		}

		if ( ! empty( $instance['text'] ) ) {
			$icon_html .= sprintf( "%s", $instance['text'] );
		}

		$icon_html .= '</div></div>';

		echo $icon_html;
	}

	protected function content_template() {
		?>
		<% if ( '' !== settings.icon ) { %>
		<div class="elementor-icon-box-wrapper">
			<%
			icon_html = '<div class="elementor-icon-box ' + settings.position + '"><i class="' + settings.icon + '" aria-hidden=="' + settings.alt_text + '"></i></div>';

			if ( settings.link.url ) {
			var link = settings.link;
			icon_html = '<a href="' + link.url + '">' + icon_html + '</a>';
			}

			if ( '' !== settings.title ) {
			icon_html += '<div class="widget-icon-text ' + settings.position + '"><h3>' + settings.title + '</h3>';
				}

				if ( '' !== settings.text ) {
				icon_html += settings.text;
				}

				icon_html += '</div></div>';

		print( icon_html );
		%>
		<% } %>
		<?php
	}
}
