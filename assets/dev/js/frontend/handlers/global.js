module.exports = function( $scope, $ ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	var animation = $scope.data( 'animation' );

	if ( ! animation ) {
		return;
	}

	$scope.addClass( 'elementor-invisible' ).removeClass( animation );

	elementorFrontend.utils.waypoint( $scope, function() {
		$scope.removeClass( 'elementor-invisible' ).addClass( animation );
	}, { offset: '90%' } );
};
