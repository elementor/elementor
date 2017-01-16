/* global elementorFrontendConfig */
( function( $ ) {
	var EventManager = require( '../utils/hooks' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
	    Utils = require( 'elementor-frontend/utils' );

	var ElementorFrontend = function() {
		var self = this,
			scopeWindow = window;

		this.config = elementorFrontendConfig;

		this.hooks = new EventManager();

		var initOnReadyComponents = function() {
			self.elementsHandler = new ElementsHandler( $ );

			self.utils = new Utils( $ );
		};

		this.getScopeWindow = function() {
			return scopeWindow;
		};

		this.setScopeWindow = function( window ) {
			scopeWindow = window;
		};

		this.isEditMode = function() {
			return self.config.isEditMode;
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

		this.addListenerOnce = function( listenerID, event, callback, to ) {
			if ( ! to ) {
				to = $( self.getScopeWindow() );
			}

			if ( ! self.isEditMode() ) {
				to.on( event, callback );

				return;
			}

			var eventNS = event + '.' + listenerID;

			to
				.off( eventNS )
				.on( eventNS, callback );
		};

		jQuery( initOnReadyComponents );
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );
