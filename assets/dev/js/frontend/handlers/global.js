module.exports = function( $scoop, $ ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	var animation = $scoop.data( 'animation' );

	if ( ! animation ) {
		return;
	}

	$scoop.addClass( 'elementor-invisible' ).removeClass( animation );

	$scoop.waypoint( function() {
		$scoop.removeClass( 'elementor-invisible' ).addClass( animation );
	}, { offset: '90%' } );
};
