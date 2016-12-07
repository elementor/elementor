module.exports = function( $scope, $ ) {
	elementorFrontend.utils.waypoint( $scope.find( '.elementor-counter-number' ), function() {
		var $number = $( this );

		$number.numerator( {
			duration: $number.data( 'duration' )
		} );
	}, { offset: '90%' } );
};
