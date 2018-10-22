<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Star_Rating extends Widget_Base {

	public function get_name() {
		return 'star-rating';
	}

	public function get_title() {
		return __( 'Star Rating', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-stars';
	}

	public function get_keywords() {
		return [ 'icon' ];
	}

	protected function _register_controls() {
		$this->start_controls_section( 'section_rating', [
				'label' => __( 'Rating', 'elementor' ),
			] );

		$this->add_control(
			'rating',
			[
				'label' => __( 'Rating', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 5,
						'step' => 0.1,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating:before' => 'width: calc({{SIZE}}% * 20)',
				],
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
				],
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_stars_style',
			[
				'label' => __( 'Stars', 'elementor-pro' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'star_style',
			[
				'label' => __( 'Star Style', 'elementor-pro' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'fontawesome' => __( 'Font Awesome', 'elementor' ),
					'unicode' => __( 'Unicode', 'elementor' ),
				],
				'render_type' => 'template',
				'prefix_class' => 'elementor--star-style-',
			]
		);

		$this->add_control(
			'stars_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating:before' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'stars_unmarked_color',
			[
				'label' => __( 'Unmarked Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'label' => __( 'Size', 'elementor-pro' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating' => 'font-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
			$icon = '&#61445;&#61445;&#61445;&#61445;&#61445;';

			if ( 'unicode' == $settings['star_style'] ) {
				$icon = '&#9733;&#9733;&#9733;&#9733;&#9733;';
			}

			$this->add_render_attribute( 'icon_wrapper', 'class', 'elementor-star-rating' );
			$this->add_render_attribute( 'icon_wrapper', 'title', $settings['rating']['size'] );

			echo '<div ' . $this->get_render_attribute_string( 'icon_wrapper' ) . '>' . $icon . '</div>';
	}

	protected function _content_template() {}
}
