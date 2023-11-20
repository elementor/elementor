jQuery( window ).on( 'elementor/frontend/init', () => {
	const addHandler = ( $element ) => {
		elementorFrontend.elementsHandler.addHandler( PlayingCardsHandler, {
			$element,
		} );
	};

	elementorFrontend.hooks.addAction( 'frontend/element_ready/playing-cards-handler.default', addHandler );
} );

class PlayingCardsHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				container: '.e-playing-cards-container',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		return {
			$container: this.$element.find( selectors.container ),
		};
	}

	bindEvents() {
		this.elements.$container.on( 'click', this.onClick.bind( this ) );
	}

	onButtonClick( event ) {
		event.preventDefault();
		debugger;
		// This.elements.$button.fadeOut().promise().done( () => {
		// 	this.elements.$content.fadeIn();
		// } );
	}
}
