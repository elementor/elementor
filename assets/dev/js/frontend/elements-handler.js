var ElementsHandler;

ElementsHandler = function( $ ) {
	var self = this;

	// element-type.skin-type
	var handlers = {
		// Elements
		'section': require( 'elementor-frontend/handlers/section' ),

		// Widgets
		'accordion.default': require( 'elementor-frontend/handlers/accordion' ),
		'alert.default': require( 'elementor-frontend/handlers/alert' ),
		'counter.default': require( 'elementor-frontend/handlers/counter' ),
		'progress.default': require( 'elementor-frontend/handlers/progress' ),
		'tabs.default': require( 'elementor-frontend/handlers/tabs' ),
		'toggle.default': require( 'elementor-frontend/handlers/toggle' ),
		'video.default': require( 'elementor-frontend/handlers/video' ),
		'image-carousel.default': require( 'elementor-frontend/handlers/image-carousel' ),
		'text-editor.default': require( 'elementor-frontend/handlers/text-editor' )
	};

	var addGlobalHandlers = function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', require( 'elementor-frontend/handlers/global' ) );
		elementorFrontend.hooks.addAction( 'frontend/element_ready/widget', require( 'elementor-frontend/handlers/widget' ) );
	};

	var addElementsHandlers = function() {
		$.each( handlers, function( elementName, funcCallback ) {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
		} );
	};

	var runElementsHandlers = function() {
		var $elements;

		if ( elementorFrontend.isEditMode() ) {
			// Elements outside from the Preview
			$elements = elementorFrontend.getScopeWindow().jQuery( '.elementor-element', '.elementor:not(.elementor-edit-mode)' );
		} else {
			$elements = $( '.elementor-element' );
		}

		$elements.each( function() {
			self.runReadyTrigger( $( this ) );
		} );
	};

	var init = function() {
		if ( ! elementorFrontend.isEditMode() ) {
			self.initHandlers();
		}
	};

	this.initHandlers = function() {
		addGlobalHandlers();

		addElementsHandlers();

		runElementsHandlers();
	};

	this.getHandlers = function( handlerName ) {
		if ( handlerName ) {
			return handlers[ handlerName ];
		}

		return handlers;
	};

	// TODO: Temp fallback method from 1.2.0
	this.addExternalListener = function( $scope, event, callback, externalElement ) {
		elementorFrontend.addListenerOnce( $scope.data( 'model-cid' ), event, callback, externalElement );
	};

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

	init();
};

module.exports = ElementsHandler;
