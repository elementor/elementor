<?php

namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor playing card`s widget.
 *
 * Elementor widget playing cards.
 *
 * @since 1.0.0
 */
class Widget_Playing_Cards extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve sidebar widget name.
	 *
	 * @return string Widget name.
	 * @since 1.0.0
	 * @access public
	 *
	 */
	public function get_name(): string {
		return 'playing-cards';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve sidebar widget title.
	 *
	 * @return string Widget title.
	 * @since 1.0.0
	 * @access public
	 *
	 */
	public function get_title(): string {
		return __( 'Playing Cards', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve playing cards widget icon.
	 *
	 * @return string Widget icon.
	 * @since 3.12.1
	 * @access public
	 *
	 */
	public function get_icon(): string {
		return 'eicon-heart';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @return array Widget keywords.
	 * @since 2.1.0
	 * @access public
	 *
	 */
	public function get_keywords(): array {
		return [ 'card', 'playing cards' ];
	}

	/**
	 * Register playing-cards widget controls.
	 *
	 * Adds card`s and card styles.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function register_controls(): void {
		$this->start_controls_section(
			'cards_section',
			[
				'label' => __( 'Cards', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'card_number',
			[
				'label' => __( 'Card Number', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'A' => __( 'A', 'elementor' ),
					'2' => __( '2', 'elementor' ),
					'3' => __( '3', 'elementor' ),
					'4' => __( '4', 'elementor' ),
					'5' => __( '5', 'elementor' ),
					'6' => __( '6', 'elementor' ),
					'7' => __( '7', 'elementor' ),
					'8' => __( '8', 'elementor' ),
					'9' => __( '9', 'elementor' ),
					'10' => __( '10', 'elementor' ),
					'J' => __( 'J', 'elementor' ),
					'Q' => __( 'Q', 'elementor' ),
					'K' => __( 'K', 'elementor' ),
				],
				'default' => 'A',
			]
		);

		$repeater->add_control(
			'card_suit',
			[
				'label' => __( 'Card Suit', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'♥' => __( 'Hearts', 'elementor' ),
					'♦' => __( 'Diamonds', 'elementor' ),
					'♣' => __( 'Clubs', 'elementor' ),
					'♠' => __( 'Spades', 'elementor' ),
				],
				'default' => '♥',
			]
		);

		$repeater->add_control(
			'card_background',
			[
				'label' => __( 'Card Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-playing-card' => '--e-card-bg-color: {{VALUE}};',
				],
			],
		);

		$repeater->add_control(
			'card_border_size',
			[
				'label' => __( 'Card Border Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 5,
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-playing-card' => '--e-card-border-size: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$repeater->add_control(
			'card_border_color',
			[
				'label' => __( 'Card Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-playing-card' => '--e-card-border-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			],
		);

		$repeater->add_control(
			'card_border_radius',
			[
				'label' => __( 'Card Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-playing-card' => '--e-card-border-radius: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$repeater->add_control(
			'card_number_color',
			[
				'label' => __( 'Card Number Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-card-number' => '--e-card-number-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			]
		);

		$repeater->add_control(
			'card_suite_color',
			[
				'label' => __( 'Card Suite Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-card-suite' => '--e-card-suite-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			]
		);

		$repeater->add_responsive_control(
			'card_size',
			[
				'label' => __( 'Card Suite Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 20,
						'max' => 80,
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-card-suite' => '--e-card-suite-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$repeater->add_control(
			'card_padding',
			[
				'label' => __( 'Card Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}.e-playing-card' => '--e-card-padding: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$this->add_control(
			'cards',
			[
				'label' => __( 'Add Cards', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'title_field' => '{{{ card_number }}} of {{{ card_suit }}}',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'cards_global_style_section',
			[
				'label' => __( 'Card Color', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'card_background',
			[
				'label' => __( 'Cards Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-card' => '--e-card-bg-color: {{VALUE}};',
				],
				'default' => '#FFFFFF',
			],
		);

		$this->add_control(
			'card_border_size',
			[
				'label' => __( 'Cards Border Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 5,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-card' => '--e-card-border-size: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$this->add_control(
			'card_border_color',
			[
				'label' => __( 'Cards Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-card' => '--e-card-border-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			],
		);

		$this->add_control(
			'card_border_radius',
			[
				'label' => __( 'Cards Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-card' => '--e-card-border-radius: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$this->add_control(
			'card_number_color',
			[
				'label' => __( 'Cards Number Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-card-number' => '--e-card-number-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'card_suite_color',
			[
				'label' => __( 'Cards Suite Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-card-suite' => '--e-card-suite-color: {{VALUE}};',
				],
				'options' => [
					'default' => __( 'Default Color', 'elementor' ),
					'custom' => __( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_responsive_control(
			'card_size',
			[
				'label' => __( 'Cards Suite Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 20,
						'max' => 80,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-card-suite' => '--e-card-suite-size: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_control(
			'card_padding',
			[
				'label' => __( 'Cards Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'rem', 'vw', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 20,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-card' => '--e-card-padding: {{SIZE}}{{UNIT}}',
				],
			],
		);

		$this->end_controls_section();
	}


	/**
	 * Render Playing cards widget output on the frontend.
	 *
	 * Refactored to use helper methods for rendering controls and individual cards.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render(): void {
        $settings = $this->get_settings_for_display();

        if ( empty( $settings['cards'] ) ) {
            return;
        }

        $this->render_card_controls();

        ?>
        <div class="e-playing-cards-container e-flex card-section">
            <?php
            foreach ( $settings['cards'] as $index => $card ) {
                $this->render_card( $index, $card );
            }
            ?>
        </div>

        <div class="e-playing-cards-container-clone e-flex card-section">
        </div>
        <?php
	}

	/**
	 * Render card controls.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render_card_controls(): void {
		?>
		<div class="e-playing-cards-controls e-button-container mb-2">
			<button type="button" class="e-button cards-play">
				<?php esc_html_e( 'Play', 'elementor' ); ?>
			</button>
			<button type="button" class="e-button cards-shuffle">
				<?php esc_html_e( 'Shuffle', 'elementor' ); ?>
			</button>
			<button type="button" class="e-button cards-play-again">
				<?php esc_html_e( 'Play Again', 'elementor' ); ?>
			</button>
		</div>
		<?php
	}

	/**
	 * Render an individual card.
	 *
	 * @param int $index Index of the card.
	 * @param array $card Card data.
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render_card( int $index, array $card ): void {
		$link_key = 'link_' . $index;

		$this->add_render_attribute($link_key, 'class', [
			'e-playing-card',
			'elementor-repeater-item-' . esc_attr( $card['_id'] ),
			'playing-card-bg',
		]);
		?>
		<div <?php $this->print_render_attribute_string( $link_key ); ?> data-value="<?php echo esc_attr( $card['_id'] ); ?>">
			<div class="e-card-inner">
				<div class="e-card-inner-back">
					⊖
				</div>
				<div class="e-card-inner-front">
					<div class="e-card-inner-front-top-icon e-playing-card-header e-card-number show-content elementor-repeater-item-<?php echo esc_attr( $card['_id'] ); ?>">
						<?php echo esc_html( $card['card_number'] ); ?>
					</div>
					<div class="e-card-inner-front-center-icon e-playing-card-body e-card-suite e-card-suite show-content elementor-repeater-item-<?php echo esc_attr( $card['_id'] ); ?>">
						<?php echo esc_html( $card['card_suit'] ); ?>
					</div>
					<div class="e-card-inner-front-bottom-icon e-card-number show-content elementor-repeater-item-<?php echo esc_attr( $card['_id'] ); ?>">
						<?php echo esc_html( $card['card_number'] ); ?>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}
