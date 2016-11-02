module.exports = function( $scoop, $ ) {
	$scoop.find( '.elementor-counter-number' ).waypoint( function() {
		var $number = $( this );

		$number.numerator( {
			duration: $number.data( 'duration' )
		} );
	}, { offset: '90%' } );
};
