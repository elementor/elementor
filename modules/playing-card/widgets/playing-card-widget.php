<?php

namespace Elementor\Modules\PlayingCard\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Playing Card widget.
 *
 * Elementor widget that displays a playing card with a number and a suit.
 *
 * @since 3.16.0
 */
class PlayingCardWidget extends Widget_Base {
	protected $suites_map  = [
		'❤️' => [
			'name' => 'Hearts',
			'color_class' => 'red',
		],
		'💎' => [
			'name' => 'Diamonds',
			'color_class' => 'red',
		],
		'♠️' => [
			'name' => 'Spades',
			'color_class' => 'black',
		],
		'♣️' => [
			'name' => 'Club',
			'color_class' => 'black',
		],
	];
	public function get_name() {
		return 'playing-card';
	}

	public function get_title() {
		return esc_html__( 'Playing Cards', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-nerd';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_keywords() {
		return [ 'card', 'playing' ];
	}

	protected function register_controls() {
		$this->add_playing_cards_content_section();
		$this->add_playing_cards_style_section();
	}

	private function add_playing_cards_content_section() {
		$this->start_controls_section(
			'section_playing_cards',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
			]
		);

		$repeater = new Repeater();

		$repeater->start_controls_tabs( 'cards_repeater' );

		$repeater->start_controls_tab(
			'content',
			[
				'label' => esc_html__( 'Content', 'elementor' ),
			]
		);

		$repeater->add_control(
			'card_number',
			[
				'label' => esc_html__( 'Card Number', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'A',
				'options' => [
					'A' => 'A',
					'2' => '2',
					'3' => '3',
					'4' => '4',
					'5' => '5',
					'6' => '6',
					'7' => '7',
					'8' => '8',
					'9' => '9',
					'10' => '10',
					'J' => 'J',
					'Q' => 'Q',
					'K' => 'K',
				],
			]
		);

		$suite_options = array_map( function ( $suite ) {
			return $suite['name'];
		}, $this->suites_map );

		$repeater->add_control(
			'card_suit',
			[
				'label' => esc_html__( 'Card Suit', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '❤️',
				'options' => $suite_options,
			]
		);

		$repeater->end_controls_tab();

		$repeater->start_controls_tab(
			'style',
			[
				'label' => esc_html__( 'Style', 'elementor' ),
			]
		);

		$repeater->add_responsive_control(
			'card_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} {{CURRENT_ITEM}}' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$repeater->end_controls_tab();

		$this->add_control(
			'playing_cards_list',
			[
				'label' => esc_html__( 'Playing cards', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'playing_card' => [
							'card_number' => 'A',
							'card_suit' => '❤️',
						],
					],
				],
			]
		);

		$this->end_controls_section();
	}

	private function add_playing_cards_style_section() {
		$this->start_controls_section(
			'section_playing_card_style',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'playing_card_item_space_between',
			[
				'label' => esc_html__( 'Space between Items', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default' => [
					'size' => 0,
				],
				'selectors' => [
					'{{WRAPPER}} > .elementor-widget-container > .e-playing-cards-wrapper' => 'gap: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();

		?>
		<div class="e-playing-cards-wrapper">
			<?php
			foreach ( $settings['playing_cards_list'] as $index => $item ) {
				$card_id          = 'card_' . $index;
				$card_number      = $item['card_number'];
				$card_suit        = $item['card_suit'];
				$card_color_class = $this->suites_map[ $card_suit ]['color_class'];

				$this->add_render_attribute( $card_id, 'class', [
					'e-playing-cards-wrapper-item',
					'elementor-repeater-item-' . $item['_id'],
					$card_color_class,
				]);

				$card_number = $item['card_number'];
				$card_suit   = $item['card_suit'];
				$card_color  = $this->suites_map[ $card_suit ]['color'];
				?>
				<div <?php $this->print_render_attribute_string( $card_id ); ?>>
					<div class="e-playing-cards-item-top"><?php echo esc_html( $card_suit ); ?></div>
					<div class="e-playing-cards-item-center e-playing-cards-item-number"><?php echo esc_html( $card_number ); ?></div>
					<div class="e-playing-cards-item-bottom"><?php echo esc_html( $card_suit ); ?></div>
				</div>
			<?php } ?>
		<?php
	}
}
