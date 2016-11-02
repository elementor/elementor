var ElementsHandler;

ElementsHandler = function( $ ) {

	this.runReadyTrigger = function( $scope ) {
		var elementType = $scope.data( 'element_type' );

		if ( ! elementType ) {
			return;
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );
	};
};

module.exports = ElementsHandler;
