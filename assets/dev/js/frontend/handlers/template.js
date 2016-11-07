module.exports = function( $scoop, $ ) {
	$scoop.find( '.elementor-element' ).each( function() {
		elementorFrontend.elementsHandler.runReadyTrigger( $( this ) );
	} );
};
