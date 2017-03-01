var GlobalHandler = elementorFrontend.Module.extend( {
	onInit: function() {
		elementorFrontend.Module.prototype.onInit.apply( this, arguments );

		var $element = this.$element;

		var animation = $element.data( 'animation' );

		if ( ! animation ) {
			return;
		}

		$element.addClass( 'elementor-invisible' ).removeClass( animation );

		elementorFrontend.utils.waypoint( $element, function() {
			$element.removeClass( 'elementor-invisible' ).addClass( 'animated ' + animation );
		}, { offset: '90%' } );
	}
} );

module.exports = function( $scope ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	new GlobalHandler( $scope );
};
