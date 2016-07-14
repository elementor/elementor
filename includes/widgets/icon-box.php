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
		return 'icon-box';
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
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_icon',
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'stacked' => __( 'Stacked', 'elementor' ),
					'framed' => __( 'Framed', 'elementor' ),
				],
				'default' => 'default',
				'prefix_class' => 'elementor-view-',
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
			'shape',
			[
				'label' => __( 'Shape', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_icon',
				'options' => [
					'circle' => __( 'Circle', 'elementor' ),
					'square' => __( 'Square', 'elementor' ),
				],
				'default' => 'circle',
				'condition' => [
					'view!' => 'default',
				],
				'prefix_class' => 'elementor-shape-',
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
				'rows' => 10,
				'separator' => 'none',
				'show_label' => false,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::URL,
				'placeholder' => __( 'http://your-link.com', 'elementor' ),
				'section' => 'section_icon',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'position',
			[
				'label' => __( 'Icon Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'top',
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'top' => [
						'title' => __( 'Top', 'elementor' ),
						'icon' => 'align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
					],
				],
				'prefix_class' => 'elementor-position-',
				'section' => 'section_icon',
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
				'section' => 'section_icon',
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
			'primary_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-framed .elementor-icon, {{WRAPPER}}.elementor-view-default .elementor-icon' => 'color: {{VALUE}}; border-color: {{VALUE}};',
				],
				'alpha' => true,
			]
		);

		$this->add_control(
			'secondary_color',
			[
				'label' => __( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'default' => '',
				'condition' => [
					'view!' => 'default',
				],
				'selectors' => [
					'{{WRAPPER}}.elementor-view-framed .elementor-icon' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon' => 'color: {{VALUE}};',
				],
				'alpha' => true,
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
						'max' => 100,
					],
				],
				'section' => 'section_style_icon',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}}.elementor-position-right .elementor-icon-box-icon' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-left .elementor-icon-box-icon' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-top .elementor-icon-box-icon' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_size',
			[
				'label' => __( 'Icon Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 6,
						'max' => 300,
					],
				],
				'section' => 'section_style_icon',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'icon_padding',
			[
				'label' => __( 'Icon Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'padding: {{SIZE}}{{UNIT}};',
				],
				'default' => [
					'size' => 1.5,
					'unit' => 'em',
				],
				'range' => [
					'em' => [
						'min' => 0,
					],
				],
				'condition' => [
					'view!' => 'default',
				],
			]
		);

		$this->add_control(
			'rotate',
			[
				'label' => __( 'Icon Rotate', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0,
					'unit' => 'deg',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon i' => 'transform: rotate({{SIZE}}{{UNIT}});',
				],
			]
		);

		$this->add_control(
			'border_width',
			[
				'label' => __( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition' => [
					'view' => 'framed',
				],
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_icon',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
				'condition' => [
					'view!' => 'default',
				],
			]
		);

		$this->add_control(
			'section_hover',
			[
				'label' => __( 'Icon Hover', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'hover_primary_color',
			[
				'label' => __( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_hover',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon:hover' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-framed .elementor-icon:hover, {{WRAPPER}}.elementor-view-default .elementor-icon:hover' => 'color: {{VALUE}}; border-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'hover_secondary_color',
			[
				'label' => __( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_hover',
				'default' => '',
				'condition' => [
					'view!' => 'default',
				],
				'selectors' => [
					'{{WRAPPER}}.elementor-view-framed .elementor-icon:hover' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-view-stacked .elementor-icon:hover' => 'color: {{VALUE}};',
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
					'justify' => [
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
				'section' => 'section_style_content',
				'tab' => self::TAB_STYLE,
				'prefix_class' => 'elementor-vertical-align-',
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
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'alpha' => true,
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-title',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
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
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'alpha' => true,
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'description_typography',
				'selector' => '{{WRAPPER}} .elementor-icon-box-content .elementor-icon-box-description',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_content',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);
	}

	protected function render( $instance = [] ) {
		$html = '<div class="elementor-icon-box-wrapper">';

		if ( ! empty( $instance['icon'] ) ) {
			$icon_html = sprintf( '<i class="%s"></i>', esc_attr( $instance['icon'] ) );

			if ( ! empty( $instance['link']['url'] ) ) {
				$target = '';

				if ( ! empty( $instance['link']['is_external'] ) ) {
					$target = ' target="_blank"';
				}

				$icon_html = sprintf( '<a href="%s"%s>%s</a>', esc_attr( $instance['link']['url'] ), $target, $icon_html );
			}

			$html .= '<div class="elementor-icon-box-icon"><div class="elementor-icon">' . $icon_html . '</div></div>';
		}

		$has_content = ! empty( $instance['title_text'] ) || ! empty( $instance['description_text'] );

		if ( $has_content ) {
			$html .= '<div class="elementor-icon-box-content">';

			if ( ! empty( $instance['title_text'] ) ) {
				$title_html = $instance['title_text'];

				if ( ! empty( $instance['link']['url'] ) ) {
					$target = '';

					if ( ! empty( $instance['link']['is_external'] ) ) {
						$target = ' target="_blank"';
					}

					$title_html = sprintf( '<a href="%s"%s>%s</a>', $instance['link']['url'], $target, $title_html );
				}

				$html .= sprintf( '<%1$s class="elementor-icon-box-title">%2$s</%1$s>', $instance['title_size'], $title_html );
			}

			if ( ! empty( $instance['description_text'] ) ) {
				$html .= sprintf( '<p class="elementor-icon-box-description">%s</p>', $instance['description_text'] );
			}

			$html .= '</div>';
		}

		$html .= '</div>';

		echo $html;
	}

	protected function content_template() {
		?>
		<%
		var html = '<div class="elementor-icon-box-wrapper">';

		if ( settings.icon ) {
			var icon_html = '<i class="' + settings.icon + '"></i>';

			if ( settings.link.url ) {
				icon_html = '<a href="' + settings.link.url + '">' + icon_html + '</a>';
			}
			
			html += '<div class="elementor-icon-box-icon"><div class="elementor-icon">' + icon_html + '</div></div>';
		}

		var hasContent = !! ( settings.title_text || settings.description_text );

		if ( hasContent ) {
			html += '<div class="elementor-icon-box-content">';

			if ( settings.title_text ) {
				var title_html = settings.title_text;

				if ( settings.link.url ) {
					title_html = '<a href="' + settings.link.url + '">' + title_html + '</a>';
				}

				html += '<' + settings.title_size  + ' class="elementor-icon-box-title">' + title_html + '</' + settings.title_size  + '>';
			}
	
			if ( settings.description_text ) {
				html += '<p class="elementor-icon-box-description">' + settings.description_text + '</p>';
			}

			html += '</div>';
		}

		html += '</div>';

		print( html );
		%>
		<?php
	}
}
