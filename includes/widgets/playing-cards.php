<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor HTML widget.
 *
 * Elementor widget that insert a playing card to the page.
 *
 * @since 3.18.0
 */
class Widget_Playing_Cards extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve HTML widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'playing-cards';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve HTML widget title.
	 *
	 * @since 3.18.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Playing Cards', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve HTML widget icon.
	 *
	 * @since 3.18.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-code';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 3.18.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'playing cards', 'card' ];
	}

	/**
	 * Register HTML widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.18.0
	 * @access protected
	 */
	protected function register_controls() {
		$card = [
			'A' => [ 'title' => esc_html__( 'A', 'elementor' ) ],
			'3' => [ 'title' => esc_html__( '3', 'elementor' ) ],
			'2' => [ 'title' => esc_html__( '2', 'elementor' ) ],
			'4' => [ 'title' => esc_html__( '4', 'elementor' ) ],
			'5' => [ 'title' => esc_html__( '5', 'elementor' ) ],
			'6' => [ 'title' => esc_html__( '6', 'elementor' ) ],
			'7' => [ 'title' => esc_html__( '7', 'elementor' ) ],
			'8' => [ 'title' => esc_html__( '8', 'elementor' ) ],
			'9' => [ 'title' => esc_html__( '9', 'elementor' ) ],
			'10' => [ 'title' => esc_html__( '10', 'elementor' ) ],
			'J' => [ 'title' => esc_html__( 'J', 'elementor' ) ],
			'Q' => [ 'title' => esc_html__( 'Q', 'elementor' ) ],
			'K' => [ 'title' => esc_html__( 'K', 'elementor' ) ],
		];

		$card_types = [
			'♠' => [ 'title' => esc_html__( '♠', 'elementor' ) ],
			'♥' => [ 'title' => esc_html__( '♥', 'elementor' ) ],
			'♣' => [ 'title' => esc_html__( '♣', 'elementor' ) ],
			'♦' => [ 'title' => esc_html__( '♦', 'elementor' ) ],
		];

		$this->start_controls_section(
			'section_playing_card_title',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'playing_card_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'K',
				'placeholder' => esc_html__( 'Choose card number', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
				'options' => $card,
			]
		);

		$repeater->add_control(
			'playing_card_type',
			[
				'label' => esc_html__( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '♥',
				'placeholder' => esc_html__( 'Tab Title', 'elementor' ),
				'dynamic' => [
					'active' => true,
				],
				'options' => $card_types,
			]
		);

		$this->add_control(
			'cards',
			[
				'label' => esc_html__( 'Cards', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [
					[
						'playing_card_number' => esc_html__( 'A', 'elementor' ),
						'playing_card_type' => esc_html__( '♠', 'elementor' ),
					],
				],
				'title_field' => '{{{ playing_card_number }}} {{{ playing_card_type }}}',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_playing_cards_style',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'playing_card_bg_color',
			[
				'label' => esc_html__( 'Background-Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'global' => [
					'default' => '',
				],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-wrapper .e-playing-card' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'playing_card_padding',
			[
				'label' => esc_html__( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-wrapper .e-playing-card' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'playing_card_gap',
			[
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em', 'rem', 'vw', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .e-playing-cards-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

	}
	/**
	 * Render HTML widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 3.18.0
	 * @access protected
	 */
	protected function render() {
		$cards = $this->get_settings_for_display( 'cards' );
		?>
		<div class="e-playing-cards-wrapper">
			<?php
			foreach ( $cards as $index => $item ) :
				$card_count = $index + 1;
				$card_color_black = '♠' === $item['playing_card_type'] || '♣' === $item['playing_card_type'];
				$card_color_class = $card_color_black ? 'e-playing-card-black' : 'e-playing-card-red';
				$playing_card_number_settings_key = $this->get_repeater_setting_key( 'playing_card_number', 'cards', $index );
				$playing_card_type_setting_key = $this->get_repeater_setting_key( 'playing_card_type', 'cards', $card_count );
				$playing_card_wrapper_setting_key = $this->get_repeater_setting_key( 'playing-card-wrapper', 'cards', $card_count );

				$this->add_render_attribute( $playing_card_number_settings_key, [
					'class' => [ 'e-playing-card-value', $card_color_class ],
					'data-playing-card-number' => $item['playing_card_number'],
					'tabindex' => '0',
				]);

				$this->add_render_attribute( $playing_card_type_setting_key, [
					'class' => [ 'e-playing-card-value', $card_color_class ],
					'data-playing-card-type' => $item['playing_card_type'],
				]);

				$this->add_render_attribute( $playing_card_wrapper_setting_key, [
					'data-card-number' => $card_count,
					'class' => [ 'e-playing-card' ],
				]);
				?>

				<div <?php $this->print_render_attribute_string( $playing_card_wrapper_setting_key ); ?> >
					<div <?php $this->print_render_attribute_string( $playing_card_number_settings_key ); ?> >
					<?php
						echo esc_html( $item['playing_card_number'] . $item['playing_card_type'] );
					?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Render HTML widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 3.18.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<# if ( settings.cards )
			var elementUid = view.getIDInt().toString().substr( 0, 3 ); #>

		<div class="e-playing-cards-wrapper">
			<# _.each( settings.cards, function( item, index ) {
			var cardCount = index + 1,
			cardUid = elementUid + cardCount,
			cardTitleKey = 'playing-card-title-' + cardUid,
			cardColorClass = item.playing_card_type === '♠' || item.playing_card_type === '♣' ? 'e-playing-card-black' : 'e-playing-card-red';

			view.addRenderAttribute( cardTitleKey, {
				'id': 'e-playing-card-' + cardUid,
				'class': [ 'e-playing-card', cardColorClass ],
				'data-card': cardCount,
				'role': 'card',
				'tabindex': 1 === cardCount ? '0' : '-1',
			} );
			#>
			<div {{{ view.getRenderAttributeString( cardTitleKey ) }}}>{{{ item.playing_card_number }}}{{{item.playing_card_type}}}</div>
			<# } ); #>
		</div>
		<?php
	}
}
