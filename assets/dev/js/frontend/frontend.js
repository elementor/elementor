/* global elementorFrontendConfig */
( function( $ ) {
	var elements = {},
		EventManager = require( '../utils/hooks' ),
		Module = require( './handler-module' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
		YouTubeModule = require( 'elementor-frontend/utils/youtube' ),
		AnchorsModule = require( 'elementor-frontend/utils/anchors' ),
		LightboxModule = require( 'elementor-frontend/utils/lightbox' );

	var ElementorFrontend = function() {
		var self = this,
			dialogsManager;

		this.config = elementorFrontendConfig;

		this.Module = Module;

		var openImageInLightbox = function() {
			var $image = $( this ).find( 'img' );

			if ( ! $image.length ) {
				return;
			}

			event.preventDefault();

			self.utils.lightbox.showModal( {
				type: 'image',
				url: $image.attr( 'src' )
			} );
		};

		var initElements = function() {
			elements.$document = $( document );

			elements.$elementor = elements.$document.find( '.elementor' );

			elements.window = window;

			elements.$window = $( window );

			elements.$imagesLinks = $( 'a' ).filter( function() {
				return /\.(png|jpe?g|gif|svg)$/i.test( this.href );
			} );
		};

		var initOnReadyComponents = function() {
			self.utils = {
				youtube: new YouTubeModule(),
				anchors: new AnchorsModule(),
				lightbox: new LightboxModule()
			};

			self.elementsHandler = new ElementsHandler( $ );
		};

		var bindEvents = function() {
			if ( elementorFrontend.getGeneralSettings( 'elementor_open_images_in_lightbox' ) ) {
				elements.$imagesLinks.on( 'click', openImageInLightbox );
			}
		};

		var getSiteSettings = function( settingType, settingName ) {
			var settingsObject = self.isEditMode() ? elementor.settings[ settingType ].model.attributes : self.config.settings[ settingType ];

			if ( settingName ) {
				return settingsObject[ settingName ];
			}

			return settingsObject;
		};

		this.init = function() {
			self.hooks = new EventManager();

			initElements();

			bindEvents();

			elements.$window.trigger( 'elementor/frontend/init' );

			initOnReadyComponents();
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

		this.getPageSettings = function( settingName ) {
			return getSiteSettings( 'page', settingName );
		};

		this.getGeneralSettings = function( settingName ) {
			return getSiteSettings( 'general', settingName );
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
				to = self.getElements( '$window' );
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

			return $element.elementorWaypoint( correctCallback, options );
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

if ( ! elementorFrontend.isEditMode() ) {
	jQuery( elementorFrontend.init );
}
