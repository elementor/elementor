module.exports = function( $scoop, $ ) {
	$scoop.find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};
