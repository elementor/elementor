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
		$start_logical = is_rtl() ? 'end' : 'start';
		$end_logical = is_rtl() ? 'start' : 'end';

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
				'placeholder' => 5,
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
				'separator' => 'before',
				'exclude_inline_options' => [ 'none' ],
			]
		);

		$this->add_responsive_control( 'icon_alignment', [
			'label' => esc_html__( 'Alignment', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => [
				'start' => [
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => "eicon-align-$start_logical-h",
				],
				'center' => [
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-align-center-h',
				],
				'end' => [
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => "eicon-align-$end_logical-h",
				],
			],
			'selectors_dictionary' => [
				'start' => '--e-rating-justify-content: flex-start;',
				'center' => '--e-rating-justify-content: center;',
				'end' => '--e-rating-justify-content: flex-end;',
			],
			'selectors' => [
				'{{WRAPPER}} .e-rating' => '{{VALUE}}',
			],
			'separator' => 'before',
		] );

		$this->end_controls_section();
	}

	protected function get_rating_value(): float {
		return floatval( $this->get_settings_for_display( 'rating_value' ) );
	}

	protected function get_rating_scale(): int {
		return intval( $this->get_settings_for_display( 'rating_scale' )['size'] );
	}

	protected function get_star_marked_width( $star_index ): string {
		$initial_value = $this->get_rating_scale();
		$rating_value = $this->get_rating_value();

		if ( empty( $rating_value ) ) {
			$rating_value = $initial_value;
		}

		$width = '0%';

		if ( $rating_value >= $star_index ) {
			$width = '100%';
		} elseif ( intval( ceil( $rating_value ) ) === $star_index ) {
			$width = ( $rating_value - ( $star_index - 1 ) ) * 100 . '%';
		}

		return $width;
	}

	protected function get_star_markup(): string {
		$icon = $this->get_settings_for_display( 'rating_icon' );
		$rating_scale = $this->get_rating_scale();

		ob_start();

		for ( $index = 1; $index <= $rating_scale; $index++ ) {
			$this->add_render_attribute( 'star_marked_' . $index, [
				'class' => 'e-star-wrapper e-star-marked',
			] );

			$star_marked_width = $this->get_star_marked_width( $index );

			if ( '100%' !== $star_marked_width ) {
				$this->add_render_attribute( 'star_marked_' . $index, [
					'style' => '--e-rating-star-marked-width: ' . $star_marked_width . ';',
				] );
			}
			?>
			<div class="e-star">
				<div <?php $this->print_render_attribute_string( 'star_marked_' . $index ); ?>>
					<?php echo Icons_Manager::try_get_icon_html( $icon, [ 'aria-hidden' => 'true' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
				<div class="e-star-wrapper e-star-unmarked">
					<?php echo Icons_Manager::try_get_icon_html( $icon, [ 'aria-hidden' => 'true' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			</div>
			<?php
		}

		return ob_get_clean();
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
			'aria-label' => sprintf( esc_html__( 'Rated %1$s out of %2$s', 'elementor' ),
				$this->get_rating_value(),
				$this->get_rating_scale()
			),
		] );
		?>
		<div <?php $this->print_render_attribute_string( 'widget' ); ?>>
			<meta itemprop="worstRating" content="0">
			<meta itemprop="bestRating" content="<?php echo $this->get_rating_scale(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
			<div <?php $this->print_render_attribute_string( 'widget_wrapper' ); ?>>
				<?php echo $this->get_star_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}
}
