<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor star rating widget.
 *
 * Elementor widget that displays star rating.
 *
 * @since 2.3.0
 */
class Widget_Star_Rating extends Widget_Base {

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
		return 'star-rating';
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
		return __( 'Star Rating', 'elementor' );
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
		return [ 'star', 'rating', 'rate', 'review' ];
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
				'label' => __( 'Rating', 'elementor' ),
			]
		);

		$this->add_control(
			'rating_scale',
			[
				'label' => __( 'Rating Scale', 'elementor' ),
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
				'label' => __( 'Rating', 'elementor' ),
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
				'label' => __( 'Icon', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'star_fontawesome' => 'Font Awesome',
					'star_unicode' => 'Unicode',
				],
				'default' => 'star_fontawesome',
				'render_type' => 'template',
				'prefix_class' => 'elementor--star-style-',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'unmarked_star_style',
			[
				'label' => __( 'Unmarked Style', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'solid' => [
						'title' => __( 'Solid', 'elementor' ),
						'icon' => 'eicon-star',
					],
					'outline' => [
						'title' => __( 'Outline', 'elementor' ),
						'icon' => 'eicon-star-o',
					],
				],
				'default' => 'solid',
			]
		);

		$this->add_control(
			'title',
			[
				'label' => __( 'Title', 'elementor' ),
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
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					],
				],
				'prefix_class' => 'elementor-star-rating%s--align-',
				'selectors' => [
					'{{WRAPPER}}' => 'text-align: {{VALUE}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title_style',
			[
				'label' => __( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_TEXT,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating__title' => 'color: {{VALUE}}',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-star-rating__title',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_shadow',
				'selector' => '{{WRAPPER}} .elementor-star-rating__title',
			]
		);

		$this->add_responsive_control(
			'title_gap',
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
					'body:not(.rtl) {{WRAPPER}}:not(.elementor-star-rating--align-justify) .elementor-star-rating__title' => 'margin-right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}}:not(.elementor-star-rating--align-justify) .elementor-star-rating__title' => 'margin-left: {{SIZE}}{{UNIT}}',
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

		$this->add_responsive_control(
			'icon_space',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
					],
				],
				'selectors' => [
					'body:not(.rtl) {{WRAPPER}} .elementor-star-rating i:not(:last-of-type)' => 'margin-right: {{SIZE}}{{UNIT}}',
					'body.rtl {{WRAPPER}} .elementor-star-rating i:not(:last-of-type)' => 'margin-left: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'stars_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-star-rating i:before' => 'color: {{VALUE}}',
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
					'{{WRAPPER}} .elementor-star-rating i' => 'color: {{VALUE}}',
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
	protected function render_stars( $icon ) {
		$rating_data = $this->get_rating();
		$rating = (float) $rating_data[0];
		$floored_rating = floor( $rating );
		$stars_html = '';

		for ( $stars = 1.0; $stars <= $rating_data[1]; $stars++ ) {
			if ( $stars <= $floored_rating ) {
				$stars_html .= '<i class="elementor-star-full">' . $icon . '</i>';
			} elseif ( $floored_rating + 1 === $stars && $rating !== $floored_rating ) {
				$stars_html .= '<i class="elementor-star-' . ( $rating - $floored_rating ) * 10 . '">' . $icon . '</i>';
			} else {
				$stars_html .= '<i class="elementor-star-empty">' . $icon . '</i>';
			}
		}

		return $stars_html;
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$rating_data = $this->get_rating();
		$textual_rating = $rating_data[0] . '/' . $rating_data[1];
		$icon = '&#xE934;';

		if ( 'star_fontawesome' === $settings['star_style'] ) {
			if ( 'outline' === $settings['unmarked_star_style'] ) {
				$icon = '&#xE933;';
			}
		} elseif ( 'star_unicode' === $settings['star_style'] ) {
			$icon = '&#9733;';

			if ( 'outline' === $settings['unmarked_star_style'] ) {
				$icon = '&#9734;';
			}
		}

		$this->add_render_attribute( 'icon_wrapper', [
			'class' => 'elementor-star-rating',
			'title' => $textual_rating,
			'itemtype' => 'http://schema.org/Rating',
			'itemscope' => '',
			'itemprop' => 'reviewRating',
		] );

		$schema_rating = '<span itemprop="ratingValue" class="elementor-screen-only">' . $textual_rating . '</span>';
		$stars_element = '<div ' . $this->get_render_attribute_string( 'icon_wrapper' ) . '>' . $this->render_stars( $icon ) . ' ' . $schema_rating . '</div>';
		?>

		<div class="elementor-star-rating__wrapper">
			<?php if ( ! Utils::is_empty( $settings['title'] ) ) : ?>
				<div class="elementor-star-rating__title"><?php echo $settings['title']; ?></div>
			<?php endif; ?>
			<?php echo $stars_element; ?>
		</div>
		<?php
	}

	/**
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
			var getRating = function() {
				var ratingScale = parseInt( settings.rating_scale, 10 ),
					rating = settings.rating > ratingScale ? ratingScale : settings.rating;

				return [ rating, ratingScale ];
			},
			ratingData = getRating(),
			rating = ratingData[0],
			textualRating = ratingData[0] + '/' + ratingData[1],
			renderStars = function( icon ) {
				var starsHtml = '',
					flooredRating = Math.floor( rating );

				for ( var stars = 1; stars <= ratingData[1]; stars++ ) {
					if ( stars <= flooredRating  ) {
						starsHtml += '<i class="elementor-star-full">' + icon + '</i>';
					} else if ( flooredRating + 1 === stars && rating !== flooredRating ) {
						starsHtml += '<i class="elementor-star-' + ( rating - flooredRating ).toFixed( 1 ) * 10 + '">' + icon + '</i>';
					} else {
						starsHtml += '<i class="elementor-star-empty">' + icon + '</i>';
					}
				}

				return starsHtml;
			},
			icon = '&#xE934;';

			if ( 'star_fontawesome' === settings.star_style ) {
				if ( 'outline' === settings.unmarked_star_style ) {
					icon = '&#xE933;';
				}
			} else if ( 'star_unicode' === settings.star_style ) {
				icon = '&#9733;';

				if ( 'outline' === settings.unmarked_star_style ) {
					icon = '&#9734;';
				}
			}

			view.addRenderAttribute( 'iconWrapper', 'class', 'elementor-star-rating' );
			view.addRenderAttribute( 'iconWrapper', 'itemtype', 'http://schema.org/Rating' );
			view.addRenderAttribute( 'iconWrapper', 'title', textualRating );
			view.addRenderAttribute( 'iconWrapper', 'itemscope', '' );
			view.addRenderAttribute( 'iconWrapper', 'itemprop', 'reviewRating' );

			var stars = renderStars( icon );
		#>

		<div class="elementor-star-rating__wrapper">
			<# if ( ! _.isEmpty( settings.title ) ) { #>
				<div class="elementor-star-rating__title">{{ settings.title }}</div>
			<# } #>
			<div {{{ view.getRenderAttributeString( 'iconWrapper' ) }}} >
				{{{ stars }}}
				<span itemprop="ratingValue" class="elementor-screen-only">{{ textualRating }}</span>
			</div>
		</div>

		<?php
	}
}
