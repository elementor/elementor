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
				'label' => __( 'Icon Box', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'icon',
			[
				'label' => __( 'Choose Icon', 'elementor' ),
				'type' => Controls_Manager::ICON,
				'default' => 'fa fa-bullhorn',
				'section' => 'section_icon',
			]
		);

		$this->add_control(
			'title_text',
			[
				'label' => __( 'Title & Description', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'This is the heading', 'elementor' ),
				'placeholder' => __( 'Your Title', 'elementor' ),
				'section' => 'section_icon',
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
				'title' => __( 'Input icon text here', 'elementor' ),
				'section' => 'section_icon',
				'label_block' => true,
				'rows' => 10,
			]
		);

		$this->add_control(
			'position',
			[
				'label' => __( 'Icon Postion', 'elementor' ),
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
				'section' => 'section_icon',
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
			'link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'section' => 'section_icon',
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
			'section_style_icon',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Icon', 'elementor' ),
				'tab'   => self::TAB_STYLE,
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
				'section' => 'section_style_icon',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-box-wrapper .elementor-icon-box-content.elementor-position-right' => 'padding-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-icon-box-wrapper .elementor-icon-box-content.elementor-position-left' => 'padding-left: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_size',
			[
				'label' => __( 'Icon Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 50,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1000,
					],
				],
				'section' => 'section_style_icon',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-box .elementor-icon-box-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_opacity',
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
				'section' => 'section_style_icon',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-box-wrapper' => 'opacity: {{SIZE}};',
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
					'{{WRAPPER}} .elementor-icon-box-wrapper .elementor-icon-box-content' => 'text-align: {{VALUE}};',
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
					'{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-title' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-title',
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
					'{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-description' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_content',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'description_typography',
				'selector' => '{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-description',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
			]
		);
	}

	protected function render( $instance = [] ) {
		$icon_html = sprintf( '<div class="elementor-icon-box-wrapper %s">', $instance['position'] );
		if ( ! empty( $instance['icon'] ) ) {
			$icon_html .= sprintf( '<div class="elementor-icon-box-icon"><i class="%s"></i></div>', esc_attr( $instance['icon'] ) );
		}

		if ( ! empty( $instance['link']['url'] ) ) {
			$target = '';
			if ( ! empty( $instance['link']['is_external'] ) ) {
				$target = ' target="_blank"';
			}
			$icon_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $icon_html );
		}

		$has_content = ! empty( $instance['title_text'] ) || ! empty( $instance['description_text'] );
		if ( $has_content ) {
			$icon_html .= '<div class="elementor-icon-box-content">';

			if ( ! empty( $instance['title_text'] ) ) {
				$icon_html .= sprintf( '<%1$s class="elementor-icon-box-title">%2$s</%1$s>', $instance['title_size'], $instance['title_text'] );
			}

			if ( ! empty( $instance['description_text'] ) ) {
				$icon_html .= sprintf( '<p class="elementor-icon-box-description">%s</p>', $instance['description_text'] );
			}

			$icon_html .= '</div>';
		}
		$icon_html .= '</div>';

		echo $icon_html;
	}

	protected function content_template() {
		?>
		<%
		var icon_html = '<div class="elementor-icon-box-wrapper ' + settings.position + '">';
		if ( '' !== settings.icon ) {
			icon_html += '<div class="elementor-icon-box-icon"><i class="' + settings.icon + '"></i></div>';
		}

		if ( '' !== settings.link.url ) {
			var link = settings.link;
			icon_html = '<a href="' + link.url + '">' + icon_html + '</a>';
		}

		var hasContent = '' !== settings.title_text || '' !== settings.description_text;
		if ( hasContent ) {
			icon_html += '<div class="elementor-icon-box-content">';

			if ( '' !== settings.title_text ) {
				icon_html += '<' + settings.title_size  + ' class="elementor-icon-box-title">' + settings.title_text + '</' + settings.title_size  + '>';
			}
	
			if ( '' !== settings.description_text ) {
				icon_html += '<p class="elementor-icon-box-description">' + settings.description_text + '</p>';
			}

			icon_html += '</div>';
		}
		icon_html += '</div>';

		print( icon_html );
		%>
		<?php
	}
}
