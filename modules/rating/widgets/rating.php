<?php

namespace Elementor\Modules\Rating\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Icons_Manager;
use Elementor\Controls_Manager;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Text_Shadow;

/**
 * Elementor star rating widget.
 *
 * Elementor widget that displays star rating.
 *
 * @since 2.3.0
 */
class Rating extends \Elementor\Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve star rating widget name.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'rating';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve star rating widget title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Rating', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve star rating widget icon.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-rating';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'rating', 'rate', 'review' ];
	}

	/**
	 * Register star rating widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_rating',
			[
				'label' => esc_html__( 'Rating', 'elementor' ),
			]
		);

		$this->add_control(
			'rating_scale',
			[
				'label' => esc_html__( 'Rating Scale', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'5' => '0-5',
					'10' => '0-10',
				],
				'default' => '5',
			]
		);

		$this->add_control(
			'rating',
			[
				'label' => esc_html__( 'Rating', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'max' => 10,
				'step' => 0.1,
				'default' => 5,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'star_style',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'separator' => 'before',
				'fa4compatibility' => 'icon',
				'default' => [
					'value' => 'fas fa-star',
					'library' => 'fa-solid',
				],
				'recommended' => [
					'fa-solid' => [ 'star' ],
					'fa-regular' => [ 'star' ],
				],
			]
		);

		$this->add_control(
			'title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'separator' => 'before',
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_responsive_control(
			'align',
			[
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
					'justify' => [
						'title' => esc_html__( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					],
				],
				'prefix_class' => 'elementor-rating%s--align-',
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title_style',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-rating__title' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-rating__title',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_shadow',
				'selector' => '{{WRAPPER}} .elementor-rating__title',
			]
		);

		$this->add_responsive_control(
			'title_gap',
			[
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}}:not(.elementor-rating--align-justify) .elementor-rating__title' => 'margin-right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}:not(.elementor-rating--align-justify) .elementor-rating__title' => 'margin-left: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_stars_style',
			[
				'label' => esc_html__( 'Stars', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'icon_size',
			[
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,

				'range' => [
					'px' => [
						'min' => 1,
						'max' => 10,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--rating-icon-size: {{SIZE}}',
				],
			]
		);

		$this->add_responsive_control(
			'icon_space',
			[
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}}' => '--rating-icon-spacing: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'stars_color',
			[
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#f6c343',
				'selectors' => [
					'{{WRAPPER}}' => '--rating-color: {{VALUE}}',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'stars_unmarked_color',
			[
				'label' => esc_html__( 'Unmarked Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#e5e5e5',
				'selectors' => [
					'{{WRAPPER}}' => '--rating-unmarked-color: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function get_rating() {
		$settings = $this->get_settings_for_display();
		$rating_scale = (int) $settings['rating_scale'];
		$rating = (float) $settings['rating'] > $rating_scale ? $rating_scale : $settings['rating'];

		return [ $rating, $rating_scale ];
	}

	/**
	 * Print the actual stars and calculate their filling.
	 *
	 * Rating type is float to allow stars-count to be a fraction.
	 * Floored-rating type is int, to represent the rounded-down stars count.
	 * In the `for` loop, the index type is float to allow comparing with the rating value.
	 *
	 * @since 2.3.0
	 * @access protected
	 */
	protected function render_stars( $settings ) {
		$rating_data = $this->get_rating();
		$rating = (float) $rating_data[0];
		$floored_rating = floor( $rating );

		// Backwards compatibility for old rating icon.
		// Inline icons svg are not supported with font awesome 5, only with e-icons.
		if ( ! isset( $settings['star_style']['library'] ) || $this->is_font_icon_inline_svg() ) {
			$settings['star_style'] = [
				'value' => 'eicon-star',
				'library' => 'eicons',
			];
		}

		for ( $stars = 1.0; $stars <= $rating_data[1]; $stars++ ) {
			$fill = 0;
			if ( $stars <= $floored_rating ) {
				$fill = 100;
			} elseif ( $floored_rating + 1 === $stars && $rating !== $floored_rating ) {
				$fill = ( $rating - $floored_rating ) * 100;
			} else {
				$fill = 0;
			}

			$icon = [
				'library' => $settings['star_style']['library'],
				'value' => $settings['star_style']['value'],
				'position' => 'left',
			];

			$svg_offsets = [
				[
					'offset' => $fill,
					'color' => 'var(--star-color)',
				],
				[
					'offset' => 100 - $fill,
					'color' => 'var(--star-unmarked-color)',
				],
			];

			Icons_Manager::render_icon( $icon, [
				'aria-hidden' => 'true',
				'style' => '--fill: ' . $fill . '%',
			], 'i', $svg_offsets );
		}

		return '';
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$rating_data = $this->get_rating();
		$textual_rating = $rating_data[0] . '/' . $rating_data[1];
		$this->add_render_attribute( 'icon_wrapper', [
			'class' => 'elementor-rating',
			'title' => $textual_rating,
			'itemtype' => 'http://schema.org/Rating',
			'itemscope' => null,
			'itemprop' => 'reviewRating',
		] );
		?>

		<div class="elementor-rating__wrapper">

		<div <?php echo esc_html( $this->get_render_attribute_string( 'icon_wrapper' ) ); ?>>
			<?php if ( ! Utils::is_empty( $settings['title'] ) ) : ?>
				<div class="elementor-rating__title"><?php echo esc_html( $settings['title'] ); ?></div>
			<?php endif;
			echo esc_html( $this->render_stars( $settings ) );
			?>
			<span itemprop="ratingValue" class="elementor-screen-only"> <?php echo esc_html( $textual_rating ); ?> </span>
			</div>
			</div>
		</div>
		<?php
	}

	private static function is_font_icon_inline_svg() {
		return Plugin::$instance->experiments->is_feature_active( 'e_font_icon_svg' );
	}

}
