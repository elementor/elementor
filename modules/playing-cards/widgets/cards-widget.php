<?php
namespace Elementor\Modules\PlayingCards\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;
use Elementor\Group_Control_Image_Size;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class CardsWidget extends Widget_Base {

	protected $card_suites_map = [
		'clubs' => [
			'name' => 'Clubs',
			'symbol' => '&#9827;',
			'color' => 'black'
		],
		'diamonds' => [
			'name' => 'Diamonds',
			'symbol' => '&#9830;',
			'color' => 'red'
		],
		'hearts' => [
			'name' => 'Hearts',
			'symbol'=> '&#9829;',
			'color' => 'red'
		],
		'spades' => [
			'name' => 'Spades',
			'symbol' => '&#9824;',
			'color' => 'black'
		]
	];

	/**
	 * Get widget name.
	 *
	 * Retrieve playing cards widget name.
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
	 * Retrieve playing cards widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Playing cards', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve playing cards widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-number-field';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return [ 'playing cards', 'card', 'cards', 'play' ];
	}

	/**
	 * Register playing cards widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {


		$this->start_controls_section(
			'section_cards',
			[
				'label' => esc_html__( 'Playing Cards', 'elementor' ),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'card_value',
			[
				'label' => esc_html__( 'Card value', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'placeholder' => esc_html__( 'List Item', 'elementor' ),
				'default' => 'A',
				'options' => [
					'A' => esc_html__( 'A', 'elementor' ),
					'2' => esc_html__( '2', 'elementor' ),
					'3' => esc_html__( '3', 'elementor' ),
					'4' => esc_html__( '4', 'elementor' ),
					'5' => esc_html__( '5', 'elementor' ),
					'6' => esc_html__( '6', 'elementor' ),
					'7' => esc_html__( '7', 'elementor' ),
					'8' => esc_html__( '8', 'elementor' ),
					'9' => esc_html__( '9', 'elementor' ),
					'10' => esc_html__( '10', 'elementor' ),
					'J' => esc_html__( 'J', 'elementor' ),
					'Q' => esc_html__( 'Q', 'elementor' ),
					'K' => esc_html__( 'K', 'elementor' ),
				],
			]
		);

		$card_suits_options = array_map( function( $option) {
			return $option['symbol'];
		}, $this->card_suites_map);

		$repeater->add_control(
			'card_suit',
			[
				'label' => esc_html__( 'Suits', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'clubs',
				'options' => $card_suits_options
			]
		);
		
		$this->add_control(
			'card_list',
			[
				'label' => esc_html__( 'Cards', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'title_field' => '{{{ card_value }}} of {{{ card_suit }}}',

			]
		);

		$this->add_control(
			'card_back_image',
			[
				'label' => esc_html__( 'Choose back image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_responsive_control(
			'align_cards',
			[
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left'    => [
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'right' => [
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					],
				],
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}} .elementor-card-list-items' => 'justify-content: {{VALUE}}',
				],
			]
		);


		$this->end_controls_section();

		$this->start_controls_section(
			'section_card_style',
			[
				'label' => esc_html__( 'Cards', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'playing_card_item_space_between',
			[
				'label' => esc_html__( 'Space between cards', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 200,
					],
				],
				'default' => [
					'size' => 12,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--e-playing-cards-gap: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->add_responsive_control(
			'playing_card_item_symbol_size',
			[
				'label' => esc_html__( 'Symbol size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px' ],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 100,
					],
				],
				'default' => [
					'size' => 40,
				],
				'selectors' => [
					'{{WRAPPER}}' => '--e-card-symbol-size: {{SIZE}}{{UNIT}}',
				],
			]
		);


		$this->end_controls_section();
	}

	/**
	 * Render playing cards widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$this->add_render_attribute( 'card_list', 'class', 'elementor-card-list-items' );
		
		?>
		<ul <?php $this->print_render_attribute_string( 'card_list' ); ?>>
		<?php
			foreach ( $settings['card_list'] as $index => $item ) {
				$card_id          = 'card_' . $index;
				$card_value      = $item['card_value'];
				$card_suit        = $item['card_suit'];
				$card_suit_symbol     = $this->card_suites_map[$card_suit]['symbol'];
				$card_suit_color    = $this->card_suites_map[$card_suit]['color'];
				$back_image_url = $settings['card_back_image']['url'];

				$this->add_render_attribute( $card_id, 'class', [
					'e-playing-cards-item',
					'e-playing-cards-item--color-' . $card_suit_color,
					'elementor-repeater-item-' . $item['_id'],
					'open'
				]);

				?>
				<div <?php $this->print_render_attribute_string( $card_id ); ?>>
					<div class="e-playing-cards-item__back" style='background-image: url("<?php echo $back_image_url  ?>")'></div>
					<div class="e-playing-cards-item__front">
						<div class="e-playing-cards-item__front__frame">
							<span><?php echo esc_html( $card_value ); ?></span>
							<span><?php echo esc_html( $card_suit_symbol ); ?></span>
						</div>
						<div class="e-playing-cards-item__front__center">
						<?php echo esc_html( $card_suit_symbol ); ?>
						</div>
						<div class="e-playing-cards-item__front__frame">
							<span><?php echo esc_html( $card_value ); ?></span>
							<span><?php echo esc_html( $card_suit_symbol ); ?></span>
						</div>
					</div>
				</div>
			<?php } ?>
		</ul>
		<?php
	}


}
