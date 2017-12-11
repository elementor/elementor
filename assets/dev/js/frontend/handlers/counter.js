module.exports = function( $scope, $ ) {
	elementorFrontend.waypoint( $scope.find( '.elementor-counter-number' ), function() {
		var $number = $( this ),
			data = $number.data();

		var decimalDigits = data.toValue.toString().match( /\.(.*)/ );

		if ( decimalDigits ) {
			data.rounding = decimalDigits[1].length;
		}

		$number.numerator( data );
	} );
};
