import Base from 'elementor-frontend/handlers/base';
export default class PlayingCards extends Base {
	constructor( ...args ) {
		super( ...args );
	}
	getDefaultSettings() {
		return {
			selectors: {
				playingCardContainer: '.e-playing-cards-container',
				playingCardsItem: '.e-playing-cards-item',
			},
		};
	}
	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$playingCardContainer: this.$element.find( selectors.playingCardContainer ),
			$playingCardsItem: this.$element.find( selectors.playingCardsItem ),
		};
	}
	bindEvents() {
		this.elements.$playingCardItem.on( 'click', this.onCardClick.bind( this ) );
	}

	unbindEvents() {
		this.elements.$playingCardItem.off( 'click', this.onCardClick.unbind( this ) );
	}

	onCardClick( event ) {
		event.preventDefault();
		const card = event?.target?.getAttribute( 'data-id' );
		// eslint-disable-next-line no-alert
		alert( `this is card number ${ card }` );
	}

	onInit( ...args ) {
		super.onInit( ...args );
		document.querySelectorAll( '.e-playing-cards-item' ).forEach( ( e ) => {
			e.addEventListener( 'click', this.clickListener );
		} );
	}
}
