/* global elementorFrontendConfig */
( function( $ ) {
	var EventManager = require( '../utils/hooks' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
	    Utils = require( 'elementor-frontend/utils' );

	var ElementorFrontend = function() {
		var self = this,
			scopeWindow = window;

		var addGlobalHandlers = function() {
			self.hooks.addAction( 'frontend/element_ready/global', require( 'elementor-frontend/handlers/global' ) );
			self.hooks.addAction( 'frontend/element_ready/widget', require( 'elementor-frontend/handlers/widget' ) );
		};

		var addElementsHandlers = function() {
			$.each( self.handlers, function( elementName, funcCallback ) {
				self.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
			} );
		};

		var runElementsHandlers = function() {
			var $elements;

			if ( self.isEditMode() ) {
				// Elements outside from the Preview
				$elements = self.getScopeWindow().jQuery( '.elementor-element', '.elementor:not(.elementor-edit-mode)' );
			} else {
				$elements = $( '.elementor-element' );
			}

			$elements.each( function() {
				self.elementsHandler.runReadyTrigger( $( this ) );
			} );
		};

		// element-type.skin-type
		this.handlers = {
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
			'menu-anchor.default': require( 'elementor-frontend/handlers/menu-anchor' )
		};

		this.config = elementorFrontendConfig;

		this.getScopeWindow = function() {
			return scopeWindow;
		};

		this.setScopeWindow = function( window ) {
			scopeWindow = window;
		};

		this.isEditMode = function() {
			return self.config.isEditMode;
		};

		this.hooks = new EventManager();
		this.elementsHandler = new ElementsHandler( $ );
		this.utils = new Utils( $ );

		this.init = function() {
			addGlobalHandlers();

			addElementsHandlers();

			self.utils.insertYTApi();

			runElementsHandlers();
		};

		// Based on underscore function
		this.throttle = function( func, wait ) {
			var timeout,
				context,
				args,
				result,
				previous = 0;

			var later = function() {
				previous = Date.now();
				timeout = null;
				result = func.apply( context, args );

				if ( ! timeout ) {
					context = args = null;
				}
			};

			return function() {
				var now = Date.now(),
					remaining = wait - ( now - previous );

				context = this;
				args = arguments;

				if ( remaining <= 0 || remaining > wait ) {
					if ( timeout ) {
						clearTimeout( timeout );
						timeout = null;
					}

					previous = now;
					result = func.apply( context, args );

					if ( ! timeout ) {
						context = args = null;
					}
				} else if ( ! timeout ) {
					timeout = setTimeout( later, remaining );
				}

				return result;
			};
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

jQuery( function() {
	if ( ! elementorFrontend.isEditMode() ) {
		elementorFrontend.init();
	}
} );
