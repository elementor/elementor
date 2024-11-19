<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Playing cards widget.
 *
 * This is an onboarding project.
 */

 class Widget_Playing_Cards extends Widget_Base {
    public function get_name() {
        return 'playing-cards';
    }

    public function get_title() {
		return esc_html__( 'Playing Cards', 'elementor' );
    }

    public function get_categories() {
        return [ 'general' ];
    }

    public function get_keywords() {
        return [ 'Cards', 'Playing Cards', 'Card', 'Play' ];
    }

    protected function is_dynamic_content(): bool {
		return false;
	}

    public function get_style_depends(): array {
		return [ 'widget-playing-cards' ];
	}

    protected function register_controls() {
        $this->start_controls_section(
			'section_title',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
			]
		);

        $repeater = new Repeater();

        $repeater->add_control(
            'number',
            [
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'A' => 'A',
					'1' => '1',
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
				'default' => 'A',
			]
        );

        $repeater->add_control(
            'suite',
            [
				'label' => esc_html__( 'Suite', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'♣' => '♣',
					'♠' => '♠',
					'♦' => '♦',
					'♥' => '♥',
				],
				'default' => '♣',
			]
        );

        $this->add_control(
			'playing_cards',
			[
				'label' => esc_html__( 'Cards', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'number' => 'A',
						'suite' => '♣'
					],
				],
				'title_field' => '{{{ number }}} {{{ suite }}}',
			]
		);

        $this->end_controls_section();

		$this->start_controls_section(
			'section_style_playng_cards',
			[
				'label' => esc_html__( 'Card', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'card_bg',
			[
				'label' => esc_html__( 'Card background color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => "#f3bafd", // $e-pink-200
				'selectors' => [
					'{{WRAPPER}} .elementor-playing-card' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'card_color',
			[
				'label' => esc_html__( 'Card text color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => "#c00bb9", // $e-pink-900
				'selectors' => [
					'{{WRAPPER}} .elementor-playing-card' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'card_padding',
			[
				'label' => esc_html__( 'Card Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'default' => [ "unit"=>"px","top"=>"15","right"=>"15","bottom"=>"15","left"=>"15","isLinked"=>true ],
				'size_units' => [ 'px', '%', 'em', 'rem' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-playing-card' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'cards_grid',
			[
				'label' => esc_html__( 'Cards Grid', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'cards_spacing',
			[
				'label' => esc_html__( 'Cards Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem' ],
				'range' => [
					'px' => [
						'max' => 100,
					],
					'em' => [
						'max' => 10,
					],
					'rem' => [
						'max' => 10,
					],
				],
				'default' => [
					'size' => 15,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-playing-cards' => 'gap: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();
    }

    protected function render() {
		$settings = $this->get_settings_for_display();

        $this->add_render_attribute( 'playing_cards', 'class', 'elementor-playing-cards' );
		$this->add_render_attribute( 'playing_card', 'class', 'elementor-playing-card' );

        ?>
		<ul <?php $this->print_render_attribute_string( 'playing_cards' ); ?>>
            <?php
                foreach ( $settings['playing_cards'] as $item ) {
                    ?>
                    <li <?php $this->print_render_attribute_string( 'playing_card' ); ?>>
                        <header><?php echo $item["number"]; ?></header>
                        <main><?php echo $item["suite"]; ?></main>
                        <footer><?php echo $item["number"]; ?></footer>
                    </li>
                    <?php
                }
            ?>
        </ul>
        
		<?php
    }

    protected function content_template() {

    }
}
