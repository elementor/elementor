var HandlerModule = require( 'elementor-frontend/handler-module' ),
	GlobalHandler;

GlobalHandler = HandlerModule.extend( {
	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var $element = this.$element;

		var animation = $element.data( 'animation' );

		if ( ! animation ) {
			return;
		}

		$element.addClass( 'elementor-invisible' ).removeClass( animation );

		elementorFrontend.waypoint( $element, function() {
			$element.removeClass( 'elementor-invisible' ).addClass( 'animated ' + animation );
		}, { offset: '90%' } );
	}
} );

module.exports = function( $scope ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	new GlobalHandler( { $element: $scope } );
};
