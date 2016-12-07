module.exports = function( $scoop, $ ) {
	elementorFrontend.utils.waypoint( $scoop.find( '.elementor-counter-number' ), function() {
		var $number = $( this );

		$number.numerator( {
			duration: $number.data( 'duration' )
		} );
	}, { offset: '90%' } );
};
