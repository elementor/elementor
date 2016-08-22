module.exports = function( $ ) {
	$( this ).find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};
