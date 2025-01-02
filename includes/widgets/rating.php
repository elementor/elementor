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
		return array( 'star', 'rating', 'review', 'score', 'scale' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	public function get_style_depends(): array {
		return array( 'widget-rating' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * @return void
	 */
	private function add_style_tab() {
		$this->start_controls_section(
			'section_icon_style',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'icon_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'min' => 0,
						'max' => 10,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--e-rating-icon-font-size: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_responsive_control(
			'icon_gap',
			array(
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'min' => 0,
						'max' => 10,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => '--e-rating-gap: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->add_control(
			'icon_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}}' => '--e-rating-icon-marked-color: {{VALUE}}',
				),
				'separator' => 'before',
			)
		);

		$this->add_control(
			'icon_unmarked_color',
			array(
				'label' => esc_html__( 'Unmarked Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}}' => '--e-rating-icon-color: {{VALUE}}',
				),
			)
		);

		$this->end_controls_section();
	}

	protected function register_controls() {
		$start_logical = is_rtl() ? 'end' : 'start';
		$end_logical = is_rtl() ? 'start' : 'end';

		$this->start_controls_section(
			'section_rating',
			array(
				'label' => esc_html__( 'Rating', 'elementor' ),
			)
		);

		$this->add_control(
			'rating_scale',
			array(
				'label' => esc_html__( 'Rating Scale', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'min' => 1,
						'max' => 10,
					),
				),
				'default' => array(
					'size' => 5,
				),
			)
		);

		$this->add_control(
			'rating_value',
			array(
				'label' => esc_html__( 'Rating', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'step' => 0.5,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_control(
			'rating_icon',
			array(
				'label' => esc_html__( 'Icon', 'elementor' ),
				'type' => Controls_Manager::ICONS,
				'fa4compatibility' => 'icon',
				'skin' => 'inline',
				'label_block' => false,
				'skin_settings' => array(
					'inline' => array(
						'icon' => array(
							'icon' => 'eicon-star',
						),
					),
				),
				'default' => array(
					'value' => 'eicon-star',
					'library' => 'eicons',
				),
				'separator' => 'before',
				'exclude_inline_options' => array( 'none' ),
			)
		);

		$this->add_responsive_control( 'icon_alignment', array(
			'label' => esc_html__( 'Alignment', 'elementor' ),
			'type' => Controls_Manager::CHOOSE,
			'options' => array(
				'start' => array(
					'title' => esc_html__( 'Start', 'elementor' ),
					'icon' => "eicon-align-$start_logical-h",
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'elementor' ),
					'icon' => 'eicon-align-center-h',
				),
				'end' => array(
					'title' => esc_html__( 'End', 'elementor' ),
					'icon' => "eicon-align-$end_logical-h",
				),
			),
			'selectors_dictionary' => array(
				'start' => '--e-rating-justify-content: flex-start;',
				'center' => '--e-rating-justify-content: center;',
				'end' => '--e-rating-justify-content: flex-end;',
			),
			'selectors' => array(
				'{{WRAPPER}}' => '{{VALUE}}',
			),
			'separator' => 'before',
		) );

		$this->end_controls_section();

		$this->add_style_tab();
	}

	protected function get_rating_value(): float {
		$initial_value = $this->get_rating_scale();
		$rating_value = $this->get_settings_for_display( 'rating_value' );

		if ( '' === $rating_value ) {
			$rating_value = $initial_value;
		}

		$rating_value = floatval( $rating_value );

		return round( $rating_value, 2 );
	}

	protected function get_rating_scale(): int {
		return intval( $this->get_settings_for_display( 'rating_scale' )['size'] );
	}

	protected function get_icon_marked_width( $icon_index ): string {
		$rating_value = $this->get_rating_value();

		$width = '0%';

		if ( $rating_value >= $icon_index ) {
			$width = '100%';
		} elseif ( intval( ceil( $rating_value ) ) === $icon_index ) {
			$width = ( $rating_value - ( $icon_index - 1 ) ) * 100 . '%';
		}

		return $width;
	}

	protected function get_icon_markup(): string {
		$icon = $this->get_settings_for_display( 'rating_icon' );
		$rating_scale = $this->get_rating_scale();

		ob_start();

		for ( $index = 1; $index <= $rating_scale; $index++ ) {
			$this->add_render_attribute( 'icon_marked_' . $index, array(
				'class' => 'e-icon-wrapper e-icon-marked',
			) );

			$icon_marked_width = $this->get_icon_marked_width( $index );

			if ( '100%' !== $icon_marked_width ) {
				$this->add_render_attribute( 'icon_marked_' . $index, array(
					'style' => '--e-rating-icon-marked-width: ' . $icon_marked_width . ';',
				) );
			}
			?>
			<div class="e-icon">
				<div <?php $this->print_render_attribute_string( 'icon_marked_' . $index ); ?>>
					<?php echo Icons_Manager::try_get_icon_html( $icon, array( 'aria-hidden' => 'true' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
				<div class="e-icon-wrapper e-icon-unmarked">
					<?php echo Icons_Manager::try_get_icon_html( $icon, array( 'aria-hidden' => 'true' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			</div>
			<?php
		}

		return ob_get_clean();
	}

	protected function render() {
		$this->add_render_attribute( 'widget', array(
			'class' => 'e-rating',
			'itemtype' => 'https://schema.org/Rating',
			'itemscope' => '',
			'itemprop' => 'reviewRating',
		) );

		$this->add_render_attribute( 'widget_wrapper', array(
			'class' => 'e-rating-wrapper',
			'itemprop' => 'ratingValue',
			'content' => $this->get_rating_value(),
			'role' => 'img',
			'aria-label' => sprintf( esc_html__( 'Rated %1$s out of %2$s', 'elementor' ),
				$this->get_rating_value(),
				$this->get_rating_scale()
			),
		) );
		?>
		<div <?php $this->print_render_attribute_string( 'widget' ); ?>>
			<meta itemprop="worstRating" content="0">
			<meta itemprop="bestRating" content="<?php echo $this->get_rating_scale(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
			<div <?php $this->print_render_attribute_string( 'widget_wrapper' ); ?>>
				<?php echo $this->get_icon_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		</div>
		<?php
	}
}
