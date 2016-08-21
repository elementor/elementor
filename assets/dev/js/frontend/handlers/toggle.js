module.exports = function( $ ) {
	var $toggleTitles = $( this ).find( '.elementor-toggle-title' );

	$toggleTitles.on( 'click', function() {
		var $active = $( this ),
			$content = $active.next();

		if ( $active.hasClass( 'active' ) ) {
			$active.removeClass( 'active' );
			$content.slideUp();
		} else {
			$active.addClass( 'active' );
			$content.slideDown();
		}
	} );
};
