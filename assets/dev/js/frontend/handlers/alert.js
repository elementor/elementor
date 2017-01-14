module.exports = function( $scope, $ ) {
	$scope.find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};
