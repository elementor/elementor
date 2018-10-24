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

		$this->add_control(
			'label',
			[
				'label' => __( 'Label', 'elementor' ),
				'type' => Controls_Manager::TEXT,
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
						'title' => __( 'Justify', 'elementor' ),
						'icon' => 'fa fa-align-justify',
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}}',
				],
				'prefix_class' => 'elementor-star-rating--align-'
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_label_style',
			[
				'label' => __( 'Label', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'label!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'label_typography',
				'selector' => '{{WRAPPER}} .elementor-star-rating__label',
			]
		);

		$this->add_control(
			'label_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating__label' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'label_gap',
			[
				'label' => __( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}:not(.elementor-star-rating--align-justify) .elementor-star-rating__label' => 'margin-right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}:not(.elementor-star-rating--align-justify) .elementor-star-rating__label' => 'margin-left: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_stars_style',
			[
				'label' => __( 'Stars', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'label' => __( 'Size', 'elementor' ),
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

		$this->add_control(
			'star_style',
			[
				'label' => __( 'Star Style', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'fontawesome' => __( 'Font Awesome', 'elementor' ),
					'unicode' => __( 'Unicode', 'elementor' ),
				],
				'render_type' => 'template',
				'prefix_class' => 'elementor--star-style-',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'unmarked_star_style',
			[
				'label' => __( 'Unmarked Star Style', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'label_block' => false,
				'options' => [
					'default' => [
						'title' => __( 'Default', 'elementor' ),
						'icon' => 'fa fa-star',
					],
					'outline' => [
						'title' => __( 'Outline', 'elementor' ),
						'icon' => 'fa fa-star-o',
					],
				],
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
				'separator' => 'before',
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

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
			$icon = '&#61445;&#61445;&#61445;&#61445;&#61445;';

			if ( 'fontawesome' == $settings['star_style'] ) {

				if ( 'outline' == $settings['unmarked_star_style'] ) {
					$icon = '&#61446;&#61446;&#61446;&#61446;&#61446;';
				}
			} elseif ( 'unicode' == $settings['star_style'] ) {

				$icon = '&#9733;&#9733;&#9733;&#9733;&#9733;';

				if ( 'outline' == $settings['unmarked_star_style'] ) {
					$icon = '&#9734;&#9734;&#9734;&#9734;&#9734;';
				}
			}

			$this->add_render_attribute( 'icon_wrapper', 'class', 'elementor-star-rating' );
			$this->add_render_attribute( 'icon_wrapper', 'title', $settings['rating']['size'] );

			$stars_element = '<div ' . $this->get_render_attribute_string( 'icon_wrapper' ) . '>' . $icon . '</div>';

			?>

        <div class="elementor-star-rating__wrapper">
            <?php if ( ! empty( $settings['label'] ) ) { ?>
                <div class="elementor-star-rating__label"><?php echo $settings['label']; ?></div>
            <?php } ?>
            <?php echo $stars_element; ?>
        </div>

        <?php
	}

	protected function _content_template() {}
}
