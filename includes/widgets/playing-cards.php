<?php

namespace Elementor;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Widget_Playing_Cards extends Widget_Base {

	private static $suit_char_map = [
		'diamond' => '&#9830;',
		'heart' => '&#9829;',
		'club' => '&#9827;',
		'spade' => '&#9824;',
	];

	private static $value_map = [
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

	private function register_cards_section_controls() {
		$this->start_controls_section(
			'cards_section',
			[
				'label' => esc_html__( 'Items', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_LAYOUT,
			]
		);

		$repeater = new \Elementor\Repeater();

		$repeater->add_control(
			'card_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'My Card', 'elementor' ),
				'label_block' => true,
			]
		);

		$repeater->add_control(
			'card_value',
			[
				'label' => esc_html__( 'Card Value', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => '1',
				'options' => static::$value_map,
			]
		);
		$repeater->add_control(
			'card_suit',
			[
				'label' => esc_html__( 'Card Suit', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'diamond',
				'options' => static::$suit_char_map,
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
						'card_title' => esc_html__( 'Card #2', 'elementor' ),
					],
				],
				'title_field' => '{{{ card_title }}}',
			]
		);

		$this->end_controls_section();
	}

	private function register_layout_section_controls() {
		$this->start_controls_section(
			'layout_section',
			[
				'label' => esc_html__( 'Layout', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_LAYOUT,
			]
		);

		$this->add_responsive_control(
			'content_width',
			[
				'label' => esc_html__( 'Card Width', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 160,
						'max' => 1000,
						'step' => 1,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-width: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->add_control(
			'layout-divider-1',
			[
				'type' => \Elementor\Controls_Manager::DIVIDER,
			]
		);
		$this->add_responsive_control(
			'content_direction',
			[
				'label' => esc_html__( 'Cards Direction', 'elementor' ),
				'type' => \Elementor\Controls_Manager::CHOOSE,
				'options' => [
					'row' => [
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-arrow-right',
					],
					'column' => [
						'title' => esc_html__( 'Down', 'elementor' ),
						'icon' => 'eicon-arrow-down',
					],
					'row-reverse' => [
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-arrow-left',
					],
					'column-reverse' => [
						'title' => esc_html__( 'Up', 'elementor' ),
						'icon' => 'eicon-arrow-up',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-cards-flex-direction: {{VALUE}};',
				],
			]
		);
		$this->add_responsive_control(
			'justify_content',
			[
				'label' => esc_html__( 'Justify Content', 'elementor' ),
				'type' => \Elementor\Controls_Manager::CHOOSE,
				'label_block' => true,
				'options' => [
					'flex-start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-start-h',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-center-h',
					],
					'flex-end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-end-h',
					],
					'space-between' => [
						'title' => esc_html__( 'Space Between', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-space-between-h',
					],
					'space-around' => [
						'title' => esc_html__( 'Space Around', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-space-around-h',
					],
					'space-evenly' => [
						'title' => esc_html__( 'Space Evenly', 'elementor' ),
						'icon' => 'eicon-flex eicon-justify-space-evenly-h',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-cards-flex-justify-content: {{VALUE}};',
				],
			]
		);
		$this->add_responsive_control(
			'align_items',
			[
				'label' => esc_html__( 'Align Items', 'elementor' ),
				'type' => \Elementor\Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-start-v',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-center-v',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-end-v',
					],
					'stretch' => [
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-flex eicon-align-stretch-v',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-cards-flex-align-items: {{VALUE}};',
				],
			]
		);
		$this->add_control(
			'layout-divider-2',
			[
				'type' => \Elementor\Controls_Manager::DIVIDER,
			]
		);
		$this->add_responsive_control(
			'cards_gap',
			[
				'label' => esc_html__( 'Gaps', 'elementor' ),
				'type' => Controls_Manager::GAPS,
				'default' => [
					'row' => '20',
					'column' => '20',
					'unit' => 'px',
				],
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-cards-row-gap: {{ROW}}{{UNIT}}; --e-cards-col-gap: {{COLUMN}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'background_color',
			[
				'label' => esc_html__( 'Background ', 'elementor' ),
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-background-color: {{VALUE}}',
				],
				'default' => '#ffffff',
			]
		);
		$this->end_controls_section();

	}

	private function register_border_controls() {
		$this->start_controls_section(
			'card_style',
			[
				'label' => esc_html__( 'Card', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_group_control(
			\Elementor\Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'selector' => '{{WRAPPER}} .e-playing-cards-item, {{WRAPPER}} .e-card-royal-image',
			]
		);
		$this->add_responsive_control(
			'border-radius',
			[
				'label' => esc_html__( 'Border Raduis', 'elementor' ),
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'custom' ],
				'range' => [
					'min' => [
						'px' => 0,
						'%' => 0,
						'em' => 0,
						'rem' => 0,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			\Elementor\Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'selector' => '{{WRAPPER}} .e-playing-cards-item',
			]
		);
		$this->end_controls_section();
	}

	private function register_value_controls() {
		$this->start_controls_section(
			'typography_section',
			[
				'label' => esc_html__( 'Typography', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_responsive_control(
			'font_family',
			[
				'label' => esc_html__( 'Font Family', 'elementor' ),
				'type' => \Elementor\Controls_Manager::FONT,
				'default' => "'Open Sans', sans-serif",
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-font-family: {{VALUE}}',
				],
			]
		);
		$this->add_responsive_control(
			'value-font-size',
			[
				'label' => esc_html__( 'Font Size', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
						'step' => 1,
					],
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'rem' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->add_responsive_control(
			'font-weight',
			[
				'label' => esc_html__( 'Font Weight', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SELECT,
				'default' => 'normal',
				'options' => [
					'100' => '100' . esc_html__( 'Thin', 'elementor' ),
					'200' => '200' . esc_html__( 'Extra Light', 'elementor' ),
					'300' => '300' . esc_html__( 'Light', 'elementor' ),
					'400' => '400' . esc_html__( 'Normal', 'elementor' ),
					'500' => '500' . esc_html__( 'Medium', 'elementor' ),
					'600' => '600' . esc_html__( 'Semi Bold', 'elementor' ),
					'700' => '700' . esc_html__( 'Bold', 'elementor' ),
					'800' => '800' . esc_html__( 'Extra Bold', 'elementor' ),
					'default' => esc_html__( 'Default', 'elementor' ),
					'normal' => esc_html__( 'Normal', 'elementor' ),
					'bold'  => esc_html__( 'Bold', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-font-weight: {{VALUE}};',
				],
			]
		);
		$this->end_controls_section();
	}

	private function register_suit_controls() {
		$this->start_controls_section(
			'suit_section',
			[
				'label' => esc_html__( 'Suit', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'suit_size',
			[
				'label' => esc_html__( 'Suit Size', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
						'step' => 1,
					],
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'rem' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-suit-font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->add_control(
			'suit_divider',
			[
				'type' => \Elementor\Controls_Manager::DIVIDER,
			]
		);
		$this->add_responsive_control(
			'diamond_color',
			[
				'label' => esc_html__( 'Diamond ', 'elementor' ) . static::$suit_char_map['diamond'],
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-diamond-color: {{VALUE}}',
				],
				'default' => '#ff0000',
			]
		);$this->add_responsive_control(
			'heart_color',
			[
				'label' => esc_html__( 'Heart ', 'elementor' ) . static::$suit_char_map['heart'],
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-heart-color: {{VALUE}}',
				],
				'default' => '#ff0000',
			]
		);$this->add_responsive_control(
			'club_color',
			[
				'label' => esc_html__( 'Club ', 'elementor' ) . static::$suit_char_map['club'],
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-club-color: {{VALUE}}',
				],
				'default' => '#000000',
			]
		);$this->add_responsive_control(
			'spade_color',
			[
				'label' => esc_html__( 'Spade ', 'elementor' ) . static::$suit_char_map['spade'],
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-spade-color: {{VALUE}}',
				],
				'default' => '#000000',
			]
		);
		$this->end_controls_section();
		$this->start_controls_section(
			'royal_suit_offset',
			[
				'label' => esc_html__( 'Royal Suit Offset', 'elementor' ),
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			]
		);
		$this->add_responsive_control(
			'royal_offset_h',
			[
				'label' => esc_html__( 'Horizontal Offset', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', '%', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
						'step' => 1,
					],
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'rem' => [
						'min' => 0,
						'max' => 100,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-royal-suit-offset-h: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->add_responsive_control(
			'royal_offset_v',
			[
				'label' => esc_html__( 'Vertical Offset', 'elementor' ),
				'type' => \Elementor\Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', '%', 'custom' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 50,
						'step' => 1,
					],
					'em' => [
						'min' => 0,
						'max' => 100,
					],
					'rem' => [
						'min' => 0,
						'max' => 100,
					],
					'%' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-container' => '--e-card-royal-suit-offset-v: {{SIZE}}{{UNIT}};',
				],
			]
		);
		$this->end_controls_section();

	}

	protected function register_controls() {
		$this->register_cards_section_controls();
		$this->register_layout_section_controls();
		$this->register_border_controls();
		$this->register_value_controls();
		$this->register_suit_controls();
	}

	private static function render_card( $value, $suit ) {
		$value = (int) $value;
		$text = static::$value_map[ $value ];
		$suit = static::$suit_char_map[ $suit ];
		$class = __( 'e-card-content', 'elementor' );
		?>
		<div class="<?php echo esc_html( 'e-card-backside' ); ?>">
			<div class="image"></div>
		</div>
		<div class="<?php echo esc_html( 'e-card-frontside' ); ?>">
			<span class="<?php echo esc_html( $class ); ?> value row_1 col_1"><?php echo esc_html( $text ); ?></span>
			<span class="<?php echo esc_html( $class ); ?> value flip row_-2 col_-2"><?php echo esc_html( $text ); ?></span>
			<?php
			if ( $value > 10 ) {
				?>
				<div class="<?php echo esc_html( $class ); ?>-royal-image" style="background-image: url( <?php echo esc_url( ELEMENTOR_ASSETS_URL . "images/playing-cards/$text.jpg" ); ?> );"></div>
				<span class="<?php echo esc_html( "$class" ); ?> suit royal end row_2 col_2"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit royal start row_-3 col_-3 flip"><?php echo esc_html( $suit ); ?></span>
				<?php
				return;
			}

			$center = [ '1', '3', '5', '9' ];
			$center_block = [ '2', '3' ];
			$inline_small = [ '6', '7', '8' ];
			?>

			<span class="<?php echo esc_html( "$class" ); ?> value row_2 col_1 self-start"><?php echo esc_html( $suit ); ?></span>
			<span class="<?php echo esc_html( "$class" ); ?> value row_-3 col_-2 self-end flip"><?php echo esc_html( $suit ); ?></span>
			<?php

			if ( in_array( $value, $center ) ) {
				?>
				<span class="<?php echo esc_html( "$class" ); ?> suit self-start row_5 col_4"><?php echo esc_html( $suit ); ?></span>
				<?php
			}
			if ( in_array( $value, $center_block ) ) {
				?>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_2 col_4"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_-3 col_4"><?php echo esc_html( $suit ); ?></span>
				<?php
			}
			if ( $value > 3 ) {
				?>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_2 col_2"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_2 col_-3"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_-3 col_2 flip"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_-3 col_-3 flip"><?php echo esc_html( $suit ); ?></span>
				<?php
			}
			if ( in_array( $value, $inline_small ) ) {
				?>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_5 col_2"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_5 col_-3"><?php echo esc_html( $suit ); ?></span>
				<?php
			}
			if ( $value > 8 ) {
				?>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_4 col_2"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_4 col_-3"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_-5 col_2 flip"><?php echo esc_html( $suit ); ?></span>
				<span class="<?php echo esc_html( "$class" ); ?> suit row_-5 col_-3 flip"><?php echo esc_html( $suit ); ?></span>
				<?php
			}
			switch ( $value ) {
				case 8:
					?>
					<span class="<?php echo esc_html( "$class" ); ?> suit row_-5-double col_4 flip"><?php echo esc_html( $suit ); ?></span>
					<?php
					// Intentional fallthrough
				case 7:
					?>
					<span class="<?php echo esc_html( "$class" ); ?> suit row_3-double col_4"><?php echo esc_html( $suit ); ?></span>
					<?php
					break;
				case 10:
					?>
					<span class="<?php echo esc_html( "$class" ); ?> suit row_3 col_4 flip"><?php echo esc_html( $suit ); ?></span>
					<span class="<?php echo esc_html( "$class" ); ?> suit row_-4 col_4 flip"><?php echo esc_html( $suit ); ?></span>
					<?php
					break;
				default:
					echo '';
					break;
			}
		echo '</div>';
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$cards = $settings['list'];
		//		echo "<pre>";
		//		print_r( $cards );
		//		echo "</pre>";
		?>
		<div class="e-playing-cards-container">

			<?php
			foreach ( $cards as $card ) {
				$_id = $card['_id'];
				$suit = $card['card_suit'];
				$value = $card['card_value'];
				$this->add_render_attribute(
					$_id,
					[
						'class' => [
							'e-playing-cards-item',
							$suit,
						],
						'data-id' => $_id,
						'data-value' => static::$value_map[ $value ],
						'data-suit' => $suit,
					]
				);
				?>
				<article <?php $this->print_render_attribute_string( $_id ); ?>>
				<?php static::render_card( $value, $suit ); ?>
				</article>
				<?php
			}
			?>

		</div>
		<?php
	}
}
