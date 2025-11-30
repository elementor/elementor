jQuery( window ).on( 'elementor/frontend/init', () => {
	jQuery( document ).on( 'click', '.atomic-action-button', function( event ) {
		event.preventDefault();

		const actionUrl = jQuery( this ).data( 'link-href' );

		if ( actionUrl ) {
			elementorFrontend.utils.urlActions.runAction( actionUrl, event );
		}
	} );
} );
