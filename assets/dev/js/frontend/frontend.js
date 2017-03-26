/* global elementorFrontendConfig */
( function( $ ) {
	var elements = {},
		EventManager = require( '../utils/hooks' ),
		Module = require( './handler-module' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
		YouTubeModule = require( 'elementor-frontend/utils/youtube' ),
		AnchorsModule = require( 'elementor-frontend/utils/anchors' );

	var ElementorFrontend = function() {
		var self = this,
			dialogsManager,
			scopeWindow = window;

		this.config = elementorFrontendConfig;

		this.hooks = new EventManager();

		this.Module = Module;

		var initElements = function() {
			elements.$document = $( self.getScopeWindow().document );

			elements.$elementor = elements.$document.find( '.elementor' );
		};

		var initOnReadyComponents = function() {
			self.utils = {
				youtube: new YouTubeModule(),
				anchors: new AnchorsModule()
			};

			self.elementsHandler = new ElementsHandler( $ );
		};

		this.init = function() {
			initElements();

			$( window ).trigger( 'elementor/frontend/init' );

			self.hooks.doAction( 'init' );
			initOnReadyComponents();
		};

		this.getScopeWindow = function() {
			return scopeWindow;
		};

		this.setScopeWindow = function( window ) {
			scopeWindow = window;
		};

		this.getElements = function( element ) {
			if ( element ) {
				return elements[ element ];
			}

			return elements;
		};

		this.getDialogsManager = function() {
			if ( ! dialogsManager ) {
				dialogsManager = new DialogsManager.Instance();
			}

			return dialogsManager;
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

			if ( to instanceof jQuery ) {
				var eventNS = event + '.' + listenerID;

				to.off( eventNS ).on( eventNS, callback );
			} else {
				to.off( event, null, listenerID ).on( event, callback, listenerID );
			}
		};

		this.getCurrentDeviceMode = function() {
			return getComputedStyle( elements.$elementor[ 0 ], ':after' ).content.replace( /"/g, '' );
		};

		this.waypoint = function( $element, callback, options ) {
			var correctCallback = function() {
				var element = this.element || this;

				return callback.apply( element, arguments );
			};

			$element.elementorWaypoint( correctCallback, options );
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

if ( ! elementorFrontend.isEditMode() ) {
	jQuery( elementorFrontend.init );
}
