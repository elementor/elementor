module.exports = function( $scoop, $ ) {
	$scoop.find( '.elementor-progress-bar' ).waypoint( function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	}, { offset: '90%' } );
};
