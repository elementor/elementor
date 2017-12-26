module.exports = function( $scope, $ ) {
	elementorFrontend.waypoint( $scope.find( '.elementor-progress-bar' ), function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	} );
};
