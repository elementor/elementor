var ElementsHandler;

ElementsHandler = function( $ ) {
	var registeredHandlers = {},
		registeredGlobalHandlers = [],
		flagEditorMode = false,
		scopeWindow = window;

	var runGlobalHandlers = function( $scope ) {
		$.each( registeredGlobalHandlers, function() {
			this.call( $scope, $, scopeWindow );
		} );
	};

	this.setEditorMode = function( mode ) {
		flagEditorMode = mode;
	};

	this.setScopeWindow = function( window ) {
		scopeWindow = window;
	};

	this.isEditorMode = function() {
		return flagEditorMode;
	};

	this.addHandler = function( widgetType, callback ) {
		registeredHandlers[ widgetType ] = callback;
	};

	this.addGlobalHandler = function( callback ) {
		registeredGlobalHandlers.push( callback );
	};

	this.runReadyTrigger = function( $scope ) {
		var elementType = $scope.data( 'element_type' );

		if ( ! elementType ) {
			return;
		}

		runGlobalHandlers( $scope );

		if ( ! registeredHandlers[ elementType ] ) {
			return;
		}

		registeredHandlers[ elementType ].call( $scope, $, scopeWindow );
	};
};

module.exports = ElementsHandler;
