import Base from 'elementor/assets/dev/js/frontend/handlers/base';
export default class PlayingCard extends Base {
	onInit( ...args ) {
		super.onInit( ...args );
	}

	getDefaultSettings() {
		return {
			selectors: {
				playingCard: '.e-playing-cards-wrapper-item',
			},
			default_state: 'expanded',
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$playingCard: this.findElement( selectors.playingCard ),
		};
	}

	bindEvents() {
		this.elements.$playingCard.on( 'click', this.clickListener.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playingCard.off();
	}

	clickListener( event ) {
		event.preventDefault();
		const cardElement = event.currentTarget;
		const cardNumber = cardElement.querySelector( '.e-playing-cards-wrapper-item--number' );
		console.log( 'The card number you chose is:' + cardNumber.innerHTML );
	}
}
