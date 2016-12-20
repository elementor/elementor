module.exports = function( $scope, $ ) {
	elementorFrontend.utils.waypoint( $scope.find( '.elementor-counter-number' ), function() {
		var $number = $( this );

		$number.numerator( $number.data() );
	}, { offset: '90%' } );
};
