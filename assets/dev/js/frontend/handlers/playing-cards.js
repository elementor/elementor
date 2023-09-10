export default class PlayingCards extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				playingCard: '.elementor-playing-card',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$playingCard: this.$element.find( selectors.playingCard ),
		};
	}

	bindEvents() {
		this.elements.$playingCard.on( 'click', this.onCardClick.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playingCard.off( 'click', this.onCardClick.unbind( this ) );
	}

	onCardClick( event ) {
		const card = event?.target?.getAttribute( 'data-card-number' );
		// eslint-disable-next-line no-alert
		alert( `this is card number ${ card }` );
	}

	onInit() {
		super.onInit();
	}
}
