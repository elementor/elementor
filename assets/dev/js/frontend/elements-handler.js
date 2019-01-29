var ElementsHandler;

ElementsHandler = function( $ ) {
	var self = this;

	// element-type.skin-type
	var handlers = {
		// Elements
		section: require( 'elementor-frontend/handlers/section' ),

		// Widgets
		'accordion.default': require( 'elementor-frontend/handlers/accordion' ),
		'alert.default': require( 'elementor-frontend/handlers/alert' ),
		'counter.default': require( 'elementor-frontend/handlers/counter' ),
		'progress.default': require( 'elementor-frontend/handlers/progress' ),
		'tabs.default': require( 'elementor-frontend/handlers/tabs' ),
		'toggle.default': require( 'elementor-frontend/handlers/toggle' ),
		'video.default': require( 'elementor-frontend/handlers/video' ),
		'image-carousel.default': require( 'elementor-frontend/handlers/image-carousel' ),
		'text-editor.default': require( 'elementor-frontend/handlers/text-editor' ),
	};

	var addGlobalHandlers = function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', require( 'elementor-frontend/handlers/global' ) );
	};

	var addElementsHandlers = function() {
		$.each( handlers, function( elementName, funcCallback ) {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
		} );
	};

	var init = function() {
		self.initHandlers();
	};

	this.initHandlers = function() {
		addGlobalHandlers();

		addElementsHandlers();
	};

	this.getHandlers = function( handlerName ) {
		if ( handlerName ) {
			return handlers[ handlerName ];
		}

		return handlers;
	};

	this.runReadyTrigger = function( scope ) {
		// Initializing the `$scope` as frontend jQuery instance
		const $scope = jQuery( scope ),
			elementType = $scope.attr( 'data-element_type' );

		if ( ! elementType ) {
			return;
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		const isWidgetType = ( -1 === [ 'section', 'column' ].indexOf( elementType ) );

		if ( isWidgetType ) {
			elementorFrontend.hooks.doAction( 'frontend/element_ready/widget', $scope, $ );
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );
	};

	init();
};

module.exports = ElementsHandler;
