<?php

namespace Elementor\Modules\PlayingCards\Widgets;

use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Playing_Cards extends Widget_Base {

	private static $SUIT_CHAR_MAP = [
		'diamond' => '&#9830;',
		'heart' => '&#9829;',
		'club' => '&#9827;',
		'spade' => '&#9824;',
	];

	private static $VALUE_MAP = [
			'1' => 'A',
			'2' => 2,
			'3' => 3,
			'4' => 4,
			'5' => 5,
			'6' => 6,
			'7' => 7,
			'8' => 8,
			'9' => 9,
			'10' => 10,
			'11' => 'J',
			'12' => 'Q',
			'13' => 'K',
	];

	private static $COLORS = [
			'diamond' => 'red',
			'heart' => 'red',
			'club' => 'black',
			'spade' => 'black',
	];

	public function get_name() {
		return 'playing-cards';
	}

	public function get_title() {
		return esc_html__( 'Playing Cards', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-heart';
	}

	public function get_keywords() {
		return [ 'playing', 'cards' ];
	}

	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
			]
		);

		$repeater = new \Elementor\Repeater();

		$repeater->add_control(
			'card_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'My Card' , 'elementor' ),
				'label_block' => true,
			]
		);

		$repeater->add_control(
				'card_value',
				[
						'label' => esc_html__( 'Card Value', 'elementor' ),
						'type' => \Elementor\Controls_Manager::SELECT,
						'default' => '1',
						'options' => static::$VALUE_MAP,
//						'selectors' => [
//								'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
//						],
				]
		);

		$repeater->add_control(
				'card_suit',
				[
						'label' => esc_html__( 'Card Suit', 'elementor' ),
						'type' => \Elementor\Controls_Manager::SELECT,
						'default' => 'diamond',
						'options' => static::$SUIT_CHAR_MAP
//						'selectors' => [
//								'{{WRAPPER}} .your-class' => 'border-style: {{VALUE}};',
//						],
				]
		);

		$this->add_control(
			'list',
			[
				'label' => esc_html__( 'Card List', 'elementor' ),
				'type' => \Elementor\Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'card_title' => esc_html__( 'Card #1', 'elementor' ),
						'card_suit' => 'diamond',
						'card_value' => '1',
					],
					[
						'card_title' => esc_html__( 'Card #2', 'textdomain' ),
					],
				],
				'title_field' => '{{{ card_title }}}',
			]
		);

		$this->end_controls_section();
	}

	private static function render_card( $value, $suit ) {
		$formatted_value = static::$VALUE_MAP[ $value ];
		$formatted_suit = static::$SUIT_CHAR_MAP[ $suit ];
		$color = static::$COLORS[ $suit ];
		$value = (int) $value;
		?>
			<span style="color: <?= $color ?>; grid-row: 1; grid-column: 1;"><?= $formatted_value ?></span>
			<span style="color: <?= $color ?>; grid-row: -2; grid-column: -2; rotate: 180deg;"><?= $formatted_value
				?></span>
		<?php
		if ( $value > 10 ) {
			?>
				<div style="grid-row: 2/-2; grid-column: 2/-2; border: 2px solid black; background-image: url( <?=
			ELEMENTOR_ASSETS_URL .	'images/playing-cards/' . $formatted_value . '.jpg' ?> ); width: 100%;
			height: 100%; background-size: cover; background-position: center"></div>

			<span style="align-self: end; justify-self: end; font-size: 4em; color: <?= $color ?>; grid-row: 2;
					grid-column: 2; position: relative; left: 10%;"><?=
				$formatted_suit
				?></span>
			<span style="align-self: start; justify-self: start; font-size: 4em; color: <?= $color ?>; grid-row: -3;
					grid-column: -3; rotate: 180deg; position: relative; left: -10%;"><?=
				$formatted_suit ?></span>
			<?php
			return;
		}
		$center = [ '1', '3', '5', '9' ];
		$center_block = [ '2', '3' ];
		$inline_small = [ '6', '7', '8' ];
		?>

		<span style="color: <?= $color ?>; grid-row: 2; grid-column: 1; align-self: start;"><?= $formatted_suit ?></span>
		<span style="color: <?= $color ?>; grid-row: -3; grid-column: -2; rotate: 180deg; align-self: end;"><?=
			$formatted_suit ?></span>
		<?php

		if ( in_array( $value, $center ) ) {
			?>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 5; grid-column: 4;"><?= $formatted_suit
				?></span>
			<?php
		}
		if ( in_array( $value, $center_block ) ) {
			?>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 2; grid-column: 4;"><?= $formatted_suit
				?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -3; grid-column: 4; rotate: 180deg;"><?=
				$formatted_suit
				?></span>
			<?php
		}
		if ( $value > 3 ) {
			?>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 2; grid-column: 2;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 2; grid-column: -3;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -3; grid-column: 2; rotate: 180deg;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -3; grid-column: -3; rotate: 180deg;"><?= $formatted_suit ?></span>
			<?php
		}
		if ( in_array( $value, $inline_small ) ) {
			?>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 5; grid-column: 2;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 5; grid-column: -3;"><?= $formatted_suit
				?></span>
			<?php
		}
		if ( $value > 8 ) {
			?>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 4; grid-column: 2;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 4; grid-column: -3;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -5; grid-column: 2; rotate: 180deg;"><?= $formatted_suit ?></span>
			<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -5; grid-column: -3; rotate: 180deg;"><?= $formatted_suit ?></span>
			<?php
		}
		switch ( $value ) {
			case 8:
				?>
				<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -3/-5; grid-column: 4; rotate:180deg;"><?= $formatted_suit ?></span>
				<?php
			case 7:
				?>
				<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 3/5; grid-column: 4;"><?= $formatted_suit ?></span>
				break;
				<?php
			case 10:
				?>
				<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: 3; grid-column: 4;"><?= $formatted_suit ?></span>
				<span style="color: <?= $color ?>; font-size: 1.75em; grid-row: -4; grid-column: 4; rotate:180deg;
						"><?= $formatted_suit ?></span>
				<?php
		}
	}

	protected function render() {
		$cards = $this->get_settings_for_display()[ 'list' ];
		?>
		<div class="e-playing-cards-container">

		<?php
		foreach ( $cards as $card ) {
			$suit = $card[ 'card_suit' ];
			$value = $card[ 'card_value' ];
		?>
			<article
					class="e-playing-cards-item"
					style="
						display: grid;
						grid-template-columns: repeat( 7, 1fr );
						grid-template-rows: repeat( 9, 1fr );
						justify-items: center;
						align-items: center;
						aspect-ratio: .6;
						width: 300px;
					"
			>
			<?php static::render_card( $value, $suit ); ?>
		</article>
		<?php
		}
		?>

		</div>
		<?php
	}

	protected function content_template() {
	}
}
