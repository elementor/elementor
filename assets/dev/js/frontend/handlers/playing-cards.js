jQuery( window ).on( 'elementor/frontend/init', () => {
	const addHandler = ( $element ) => {
		elementorFrontend.elementsHandler.addHandler( PlayingCards, {
			$element,
		} );
	};
	elementorFrontend.hooks.addAction( 'frontend/element_ready/playing-cards-handler.default', addHandler );
} );

class PlayingCards extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				platyingCard: '.e-playing-cards-item',
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
		const card = event?.target?.getAttribute( 'data-id' );
		// eslint-disable-next-line no-alert
		alert( `this is card id ${ card }` );
	}
	onInit() {
		document.querySelectorAll( '.e-card-list-item' ).forEach( ( e ) => {
			e.addEventListener( 'click', this.onCardClick );
		} );
		super.onInit();
	}
}
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
