<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor playing cards widget.
 *
 * Elementor widget that inserts a playing cards of a certain type and value.
 *
 * @since 3.12.1
 */
class Widget_Playing_Cards extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve playing cards widget name.
	 *
	 * @since 3.12.1
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name(): string {
		return 'playing-cards';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve playing cards widget title.
	 *
	 * @since 3.12.1
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title(): string {
		return esc_html__( 'Playing Cards', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve playing cards widget icon.
	 *
	 * @since 3.12.1
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon(): string {
		return 'eicon-heart';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the playing cards widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 3.12.1
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories(): array {
		return [ 'general' ];
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 3.12.1
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords(): array {
		return [ 'card' ];
	}

	/**
	 * Register playing cards widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.12.1
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_cards',
			[
				'label' => esc_html__( 'Cards', 'elementor' ),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'card_type',
			[
				'label' => esc_html__( 'Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'spade' => esc_html__( 'Spade', 'elementor' ),
					'diamond' => esc_html__( 'Diamond', 'elementor' ),
					'heart' => esc_html__( 'Heart', 'elementor' ),
					'club' => esc_html__( 'Club', 'elementor' ),
				],
				'default' => 'spade',
				'separator' => 'before',
			]
		);

		$repeater->add_control(
			'card_value',
			[
				'label' => esc_html__( 'Value', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'2'  => '2',
					'3'  => '3',
					'4'  => '4',
					'5'  => '5',
					'6'  => '6',
					'7'  => '7',
					'8'  => '8',
					'9'  => '9',
					'10' => '10',
					'J'  => esc_html_x( 'J', 'Playing cards value', 'elementor' ),
					'Q'  => esc_html_x( 'Q', 'Playing cards value', 'elementor' ),
					'K'  => esc_html_x( 'K', 'Playing cards value', 'elementor' ),
					'A'  => esc_html_x( 'A', 'Playing cards value', 'elementor' ),
				],
				'default'   => '2',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'cards_list',
			[
				'label' => esc_html__( 'Hand', 'elementor' ),
				'type' => Controls_Manager::REPEATER,
				'fields' => $repeater->get_controls(),
				'default' => [],
				'title_field' => '{{ card_type }} ({{ card_value }})',
			]
		);

		$this->add_control(
			'hover_animation',
			[
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'pulse' => esc_html__( 'Pulse', 'elementor' ),
					'bounce' => esc_html__( 'Bounce', 'elementor' ),
				],
				'default' => 'pulse',
				'separator' => 'before',
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render playing cards widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 3.12.1
	 * @access protected
	 */
	protected function render() {
		$cards = $this->get_settings_for_display( 'cards_list' );
		$hover_animation = $this->get_settings_for_display( 'hover_animation' );

		$this->add_render_attribute( 'wrapper', 'class', 'elementor-playing-cards elementor-playing-cards-' . $hover_animation );

		$types = [
			'spade' => '♠',
			'diamond' => '♦',
			'heart' => '♥',
			'club' => '♣',
		];
		?>
		<div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
			<span class="elementor-screen-only" role="heading">
				<?php echo esc_html__( 'Playing Cards', 'elementor' ); ?>
			</span>

			<?php
			foreach ( $cards as $card ) {
				$id = $card['_id'];
				$type = $card['card_type'];
				$value = $card['card_value'];

				$this->add_render_attribute( 'card-' . $id, 'class', sprintf( 'elementor-playing-card elementor-playing-card-%s elementor-playing-card-%s', $id, $type ) );
				?>
				<div <?php $this->print_render_attribute_string( 'card-' . $id ); ?> tabindex="0">
					<span class="elementor-screen-only" role="heading">
						<?php printf( esc_html__( 'Playing card of type %1$s and value %2$s', 'elementor' ), esc_html( $type ), esc_html( $value ) ); ?>
					</span>

					<div class="elementor-playing-card-header"><?php echo esc_html( $value ); ?></div>
					<div class="elementor-playing-card-body"><?php echo esc_html( $types[ $type ] ) ?? ''; ?></div>
					<div class="elementor-playing-card-footer"><?php echo esc_html( $value ); ?></div>
				</div>
			<?php } ?>
		</div>
		<?php
	}

	/**
	 * Render playing cards widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 3.12.1
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		const getCardSymbol = ( type ) => {
			const types = {
				spade: '♠',
				diamond: '♦',
				heart: '♥',
				club: '♣',
			};

			return types[type] || '';
		}

		view.addRenderAttribute( {
			wrapper: { class: 'elementor-playing-cards elementor-playing-cards-' + settings.hover_animation },
		} );
		#>

		<div {{{ view.getRenderAttributeString( 'wrapper' ) }}}>
			<span class="elementor-screen-only" role="heading">
				<?php echo esc_html__( 'Playing Cards', 'elementor' ); ?>
			</span>

			<#
			_.each( settings.cards_list, ( card ) => {
				view.addRenderAttribute( {
					['card-' + card._id]: { class: 'elementor-playing-card elementor-playing-card-' + card._id + ' elementor-playing-card-' + card.card_type },
				} );
			#>
			<div {{{ view.getRenderAttributeString( 'card-' + card._id ) }}} tabindex="0">
				<span class="elementor-screen-only" role="heading">
					<?php
					printf( esc_html__( 'Playing card of type %1$s and value %2$s', 'elementor' ), '{{card.card_type}}', '{{card.card_value}}' );
					?>
				</span>

				<div class="elementor-playing-card-header">{{ card.card_value }}</div>
				<div class="elementor-playing-card-body">{{ getCardSymbol( card.card_type ) }}</div>
				<div class="elementor-playing-card-footer">{{ card.card_value }}</div>
			</div>
			<# } ); #>
		</div>
		<?php
	}
}
