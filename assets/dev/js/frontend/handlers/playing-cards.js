import Base from 'elementor-frontend/handlers/base';

export default class PlayingCards extends Base {
	getDefaultSettings() {
		return {
			selectors: {
				playingCardContainer: '.e-playing-cards-container',
				playingCards: '.e-playing-cards-item',
			},
		};
	}

	getDefaultElements() {
		const { playingCardContainer, playingCards } = this.getSettings( 'selectors' );
		return {
			$playingCardContainer: this.$element.find( playingCardContainer ),
			$playingCards: this.$element.find( playingCards ),
		};
	}

	bindEvents() {
		this.elements.$playingCards.on( 'click', this.onCardClick.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playingCards.off( 'click', this.onCardClick.unbind( this ) );
	}

	onCardClick( event ) {
		event.preventDefault();
		event.target.classList.toggle( 'flipped' );
	}

	onInit( ...args ) {
		super.onInit( ...args );
	}
}
