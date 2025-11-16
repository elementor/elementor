class HeadingActionHandler extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				actionButton: '.e-heading-action-button',
			},
		};
	}

	bindEvents() {
		this.$element.on( 'click', this.getSettings( 'selectors.actionButton' ), this.onActionButtonClick.bind( this ) );
	}

	onActionButtonClick( event ) {
		event.preventDefault();
		
		const $button = jQuery( event.currentTarget );
		const actionUrl = $button.data( 'href' );
		
		if ( actionUrl ) {
			elementorFrontend.utils.urlActions.runAction( actionUrl, event );
		}
	}
}

jQuery( window ).on( 'elementor/frontend/init', () => {
	elementorFrontend.elementsHandler.attachHandler( 'e-heading', HeadingActionHandler );
	
	jQuery( document ).on( 'click', '.e-heading-action-button', function( event ) {
		event.preventDefault();
		
		const actionUrl = jQuery( this ).data( 'href' );
		
		if ( actionUrl ) {
			elementorFrontend.utils.urlActions.runAction( actionUrl, event );
		}
	} );
} );

