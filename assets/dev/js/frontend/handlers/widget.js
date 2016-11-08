module.exports = function( $scoop, $ ) {
	if ( ! elementorFrontend.isEditMode() ) {
		return;
	}

	if ( $scoop.hasClass( 'elementor-widget-edit-disabled' ) ) {
		return;
	}

	$scoop.find( '.elementor-element' ).each( function() {
		elementorFrontend.elementsHandler.runReadyTrigger( $( this ) );
	} );
};
