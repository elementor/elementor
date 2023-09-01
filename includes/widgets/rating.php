<?php
namespace Elementor;

use Elementor\Icons_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor (new) rating widget.
 *
 * @since 3.17.0
 */
class Widget_Rating extends Widget_Base {

	public function get_name() {
		return 'rating';
	}

	public function get_title() {
		return esc_html__( 'Rating', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-rating';
	}

	public function get_keywords() {
		return [ 'star', 'rating', 'review', 'score', 'scale' ];
	}

	protected function register_controls() {
		$this->start_controls_section(
			'section_rating',
			[
				'label' => esc_html__( 'Rating', 'elementor' ),
			]
		);

		 $this->add_control(
		 	'rating_maximum_value',
		 	[
		 		'label' => esc_html__( 'Rating Scale', 'elementor' ),
		 		'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'min' => 1,
						'max' => 10,
					],
				],
				'step' => 1,
				'default' => [
					'size' => '5',
				],
		 	]
		 );

		$this->add_control(
			'rating_value',
			[
				'label' => esc_html__( 'Rating', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'step' => 0.01,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'rating_icon',
			[
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => [
					'inline' => [
						'icon' => [
							'icon' => 'eicon-star',
						],
					],
				],
				'default' => [
					'value' => 'eicon-star',
					'library' => 'eicons',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function get_rating_value(): float {
		return floatval( $this->get_settings_for_display( 'rating_value' ) );
	}

	protected function get_rating_maximum_value(): int {
		return intval( $this->get_settings_for_display( 'rating_maximum_value' )['size'] );
	}

	protected function get_marked_star_width( $star_index ): string {
		$rating_value = $this->get_rating_value();

		if ( $star_index <= $rating_value ) {
			return '100%';
		} else if ( $star_index === intval( ceil( $rating_value ) ) ) {
			return ( $rating_value - ( $star_index - 1 ) ) * 100 . '%';
		}

		return '0%';
	}

	protected function get_star_markup(): string {
		$icon = $this->get_settings_for_display( 'rating_icon') ;
		$rating_maximum_value = $this->get_rating_maximum_value();
		$output = '';

		for ( $index = 1; $index <= $rating_maximum_value; $index++ ) {
			$output .= '<div class="e-star">';
			$output .= '<div class="e-star-wrapper e-star-marked " style="--e-rating-marked-star-width: ' . $this->get_marked_star_width( $index ) . ';">';
			$output .= Icons_Manager::try_get_icon_html( $icon, [ 'aria-hidden' => 'true' ] );
			$output .= '</div>';
			$output .= '<div class="e-star-wrapper e-star-unmarked">';
			$output .= Icons_Manager::try_get_icon_html( $icon, [ 'aria-hidden' => 'true' ] );
			$output .= '</div>';
			$output .= '</div>';
		}

		return $output;
	}

	protected function render() {
		$this->add_render_attribute( 'widget', [
			'class' => 'e-rating',
			'itemtype' => 'https://schema.org/Rating',
			'itemscope' => '',
			'itemprop' => 'reviewRating',
		] );

		$this->add_render_attribute( 'widget_wrapper', [
			'class' => 'e-rating-wrapper',
			'itemprop' => 'reviewValue',
			'content' => $this->get_rating_value(),
			'role' => 'img',
			'aria-label' => $this->get_rating_value() . ' and a half of ' . $this->get_rating_maximum_value() . ' stars',
		] );
		?>
		<div <?php $this->print_render_attribute_string( 'widget' ); ?>>
			<meta itemprop="worstRating" content="0">
			<meta itemprop="bestRating" content="<?php echo $this->get_rating_maximum_value(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
			<div <?php $this->print_render_attribute_string( 'widget_wrapper' ); ?>>
				<?php echo $this->get_star_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}
}
