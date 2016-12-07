var ElementsHandler;

ElementsHandler = function( $ ) {
	this.runReadyTrigger = function( $scope ) {
		var elementType = $scope.data( 'element_type' );

		if ( ! elementType ) {
			return;
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		var isWidgetType = ( -1 === [ 'section', 'column' ].indexOf( elementType ) );

		if ( isWidgetType ) {
			elementorFrontend.hooks.doAction( 'frontend/element_ready/widget', $scope, $ );
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );
	};

	this.addExternalListener = function( $scope, event, callback, externalElement ) {
		var $externalElement = $( externalElement || elementorFrontend.getScopeWindow() );

		if ( ! elementorFrontend.isEditMode() ) {
			$externalElement.on( event, callback );

			return;
		}

		var eventNS = event + '.' + $scope.attr( 'id' );

		$externalElement
			.off( eventNS )
			.on( eventNS, callback );
	};
};

module.exports = ElementsHandler;
