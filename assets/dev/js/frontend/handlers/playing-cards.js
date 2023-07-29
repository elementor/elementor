import Base from 'elementor/assets/dev/js/frontend/handlers/base';

export default class PlayingCards extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				toggleVisibilityButton: '.elementor-playing-cards-toggle-button',
				playingCard: '.elementor-playing-card',
				cardTitle: '.elementor-playing-card-title',
				visibilityStatus: '.elementor-playing-cards-visibility-status',
			},
			cardsVisible: true,
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$toggleVisibilityButton: this.$element.find( selectors.toggleVisibilityButton ),
			$playingCards: this.$element.find( selectors.playingCard ),
			$cardTitles: this.$element.find( selectors.cardTitle ),
			$visibilityStatus: this.$element.find( selectors.visibilityStatus ),
		};
	}

	bindEvents() {
		this.elements.$toggleVisibilityButton.on( 'click', this.onVisibilityToggleButtonClick.bind( this ) );
	}

	onVisibilityToggleButtonClick( event ) {
		const cardsVisible = ! this.getSettings( 'cardsVisible' );

		this.setSettings( { cardsVisible } );

		const button = event.target;
		const { $playingCards, $visibilityStatus, $cardTitles } = this.elements;

		$playingCards.toggleClass( 'elementor-playing-card-hidden' );

		button.innerText = cardsVisible
			? __( 'Hide', 'elementor' )
			: __( 'Show', 'elementor' );

		$visibilityStatus.text( cardsVisible
			? __( 'Cards visible', 'elementor' )
			: __( 'Cards hidden', 'elementor' ),
		);

		$cardTitles.each( function() {
			const { type, value } = this.dataset;

			this.innerText = cardsVisible
				? sprintf(
					// Translators: %1$s: Card type. %2$s: Card value
					__( 'Playing card of type %1$s and value %2$s', 'elementor' ), type, value )
				: __( 'Card hidden', 'elementor' );
		} );
	}
}
