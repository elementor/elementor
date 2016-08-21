( function( $ ) {
	var ElementsHandler = require( 'elementor-frontend/elements-handler' ),
	    Utils = require( 'elementor-frontend/utils' );

	var ElementorFrontend = function() {
		var self = this,
			elements = {};

		var elementsDefaultHandlers = {
			accordion: require( 'elementor-frontend/handlers/accordion' ),
			alert: require( 'elementor-frontend/handlers/alert' ),
			counter: require( 'elementor-frontend/handlers/counter' ),
			'image-carousel': require( 'elementor-frontend/handlers/image-carousel' ),
			'menu-anchor': require( 'elementor-frontend/handlers/menu-anchor' ),
			progress: require( 'elementor-frontend/handlers/progress' ),
			section: require( 'elementor-frontend/handlers/section' ),
			tabs: require( 'elementor-frontend/handlers/tabs' ),
			toggle: require( 'elementor-frontend/handlers/toggle' ),
			video: require( 'elementor-frontend/handlers/video' )
		};

		var initElements = function() {
			elements.$elementorElements = $( '.elementor-element' );
		};

		var addGlobalHandlers = function() {
			self.elementsHandler.addGlobalHandler( require( 'elementor-frontend/handlers/global' ) );
		};

		var addElementsHandlers = function() {
			$.each( elementsDefaultHandlers, function( elementName ) {
				self.elementsHandler.addHandler( elementName, this );
			} );
		};

		var runElementsHandlers = function() {
			elements.$elementorElements.each( function() {
				self.elementsHandler.runReadyTrigger( $( this ) );
			} );
		};

		this.elementsHandler = new ElementsHandler( $ );

		this.utils = new Utils( $ );

		this.init = function() {
			initElements();

			addGlobalHandlers();

			addElementsHandlers();

			self.utils.insertYTApi();

			runElementsHandlers();
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

jQuery( elementorFrontend.init );
