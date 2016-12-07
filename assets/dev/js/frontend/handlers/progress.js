module.exports = function( $scoop, $ ) {
	elementorFrontend.utils.waypoint( $scoop.find( '.elementor-progress-bar' ), function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	}, { offset: '90%' } );
};
