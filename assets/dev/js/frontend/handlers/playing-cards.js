export default class PlayingCards extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				card: '.elementor-playing-card',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		const [ $widgetWrapper ] = this.$element;
		const $cards = $widgetWrapper.querySelectorAll( selectors.card );

		return {
			$widgetWrapper,
			$cards,
		};
	}

	bindEvents() {
		this.elements.$cards.forEach( ( card ) => {
			const handleClick = this.onCardClick.bind( this );
			card.addEventListener( 'click', handleClick );
		} );
	}

	onCardClick(e) {
		e.currentTarget.classList.toggle( 'back' );
	}
}
