(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		'menu-anchor.default': require( 'elementor-frontend/handlers/menu-anchor' )
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

},{"elementor-frontend/handlers/accordion":4,"elementor-frontend/handlers/alert":5,"elementor-frontend/handlers/counter":6,"elementor-frontend/handlers/global":7,"elementor-frontend/handlers/image-carousel":8,"elementor-frontend/handlers/menu-anchor":9,"elementor-frontend/handlers/progress":10,"elementor-frontend/handlers/section":11,"elementor-frontend/handlers/tabs":12,"elementor-frontend/handlers/toggle":13,"elementor-frontend/handlers/video":14,"elementor-frontend/handlers/widget":15}],2:[function(require,module,exports){
var Module = require( '../utils/module' ),
	FrontendModule;

FrontendModule = Module.extend( {
	__construct: function( $element ) {
		this.$element  = $element;
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		var elementSettings;

		if ( elementorFrontend.isEditMode() ) {
			var settings = elementorFrontend.config.elements.data[ this.getModelCID() ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.widgetType ];

			elementSettings = _.pick( settings, settingsKeys );
		} else {
			elementSettings = this.$element.data( 'settings' );
		}

		return this.getItems( elementSettings, setting );
	}
} );

FrontendModule.prototype.getElementName = function() {};

module.exports = FrontendModule;

},{"../utils/module":18}],3:[function(require,module,exports){
/* global elementorFrontendConfig */
( function( $ ) {
	var elements = {},
		EventManager = require( '../utils/hooks' ),
		Module = require( './frontend-module' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
	    Utils = require( 'elementor-frontend/utils' );

	var ElementorFrontend = function() {
		var self = this,
			scopeWindow = window;

		this.config = elementorFrontendConfig;

		this.hooks = new EventManager();

		this.Module = Module;

		var initElements = function() {
			elements.$document = $( self.getScopeWindow().document );

			elements.$elementor = elements.$document.find( '.elementor' );
		};

		var initOnReadyComponents = function() {
			self.utils = new Utils( $ );

			self.elementsHandler = new ElementsHandler( $ );
		};

		this.init = function() {
			initElements();

			initOnReadyComponents();

			self.hooks.doAction( 'init' );
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
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

if ( ! elementorFrontend.isEditMode() ) {
	jQuery( elementorFrontend.init );
}

},{"../utils/hooks":17,"./frontend-module":2,"elementor-frontend/elements-handler":1,"elementor-frontend/utils":16}],4:[function(require,module,exports){
var activateSection = function( sectionIndex, $accordionTitles ) {
	var $activeTitle = $accordionTitles.filter( '.active' ),
		$requestedTitle = $accordionTitles.filter( '[data-section="' + sectionIndex + '"]' ),
		isRequestedActive = $requestedTitle.hasClass( 'active' );

	$activeTitle
		.removeClass( 'active' )
		.next()
		.slideUp();

	if ( ! isRequestedActive ) {
		$requestedTitle
			.addClass( 'active' )
			.next()
			.slideDown();
	}
};

module.exports = function( $scope, $ ) {
	var defaultActiveSection = $scope.find( '.elementor-accordion' ).data( 'active-section' ),
		$accordionTitles = $scope.find( '.elementor-accordion-title' );

	if ( ! defaultActiveSection ) {
		defaultActiveSection = 1;
	}

	activateSection( defaultActiveSection, $accordionTitles );

	$accordionTitles.on( 'click', function() {
		activateSection( this.dataset.section, $accordionTitles );
	} );
};

},{}],5:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	$scope.find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};

},{}],6:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	elementorFrontend.utils.waypoint( $scope.find( '.elementor-counter-number' ), function() {
		var $number = $( this ),
			data = $number.data();

		var decimalDigits = data.toValue.toString().match( /\.(.*)/ );

		if ( decimalDigits ) {
			data.rounding = decimalDigits[1].length;
		}

		$number.numerator( data );
	}, { offset: '90%' } );
};

},{}],7:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	var animation = $scope.data( 'animation' );

	if ( ! animation ) {
		return;
	}

	$scope.addClass( 'elementor-invisible' ).removeClass( animation );

	elementorFrontend.utils.waypoint( $scope, function() {
		$scope.removeClass( 'elementor-invisible' ).addClass( 'animated ' + animation );
	}, { offset: '90%' } );
};

},{}],8:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var $carousel = $scope.find( '.elementor-image-carousel' );
	if ( ! $carousel.length ) {
		return;
	}

	var savedOptions = $carousel.data( 'slider_options' ),
		tabletSlides = 1 === savedOptions.slidesToShow ? 1 : 2,
		defaultOptions = {
			responsive: [
				{
					breakpoint: 767,
					settings: {
						slidesToShow: tabletSlides,
						slidesToScroll: tabletSlides
					}
				},
				{
					breakpoint: 480,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1
					}
				}
			]
		},

		slickOptions = $.extend( {}, defaultOptions, $carousel.data( 'slider_options' ) );

	$carousel.slick( slickOptions );
};

},{}],9:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	if ( elementorFrontend.isEditMode() ) {
		return;
	}

	var $anchor = $scope.find( '.elementor-menu-anchor' ),
		anchorID = $anchor.attr( 'id' ),
		$anchorLinks = $( 'a[href*="#' + anchorID + '"]' ),
		$scrollable = $( 'html, body' ),
		adminBarHeight = $( '#wpadminbar' ).height();

	$anchorLinks.on( 'click', function( event ) {
		var isSamePathname = ( location.pathname === this.pathname ),
			isSameHostname = ( location.hostname === this.hostname );

		if ( ! isSameHostname || ! isSamePathname ) {
			return;
		}

		event.preventDefault();

		var scrollTop = $anchor.offset().top - adminBarHeight;

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		$scrollable.animate( {
			scrollTop: scrollTop
		}, 1000 );
	} );
};

},{}],10:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	elementorFrontend.utils.waypoint( $scope.find( '.elementor-progress-bar' ), function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	}, { offset: '90%' } );
};

},{}],11:[function(require,module,exports){
var BackgroundVideo = function( $backgroundVideoContainer, $ ) {
	var player,
		elements = {},
		isYTVideo = false;

	var calcVideosSize = function() {
		var containerWidth = $backgroundVideoContainer.outerWidth(),
			containerHeight = $backgroundVideoContainer.outerHeight(),
			aspectRatioSetting = '16:9', //TEMP
			aspectRatioArray = aspectRatioSetting.split( ':' ),
			aspectRatio = aspectRatioArray[ 0 ] / aspectRatioArray[ 1 ],
			ratioWidth = containerWidth / aspectRatio,
			ratioHeight = containerHeight * aspectRatio,
			isWidthFixed = containerWidth / containerHeight > aspectRatio;

		return {
			width: isWidthFixed ? containerWidth : ratioHeight,
			height: isWidthFixed ? ratioWidth : containerHeight
		};
	};

	var changeVideoSize = function() {
		var $video = isYTVideo ? $( player.getIframe() ) : elements.$backgroundVideo,
			size = calcVideosSize();

		$video.width( size.width ).height( size.height );
	};

	var prepareYTVideo = function( YT, videoID ) {
		player = new YT.Player( elements.$backgroundVideo[ 0 ], {
			videoId: videoID,
			events: {
				onReady: function() {
					player.mute();

					changeVideoSize();

					player.playVideo();
				},
				onStateChange: function( event ) {
					if ( event.data === YT.PlayerState.ENDED ) {
						player.seekTo( 0 );
					}
				}
			},
			playerVars: {
				controls: 0,
				showinfo: 0
			}
		} );

		$( elementorFrontend.getScopeWindow() ).on( 'resize', changeVideoSize );
	};

	var initElements = function() {
		elements.$backgroundVideo = $backgroundVideoContainer.children( '.elementor-background-video' );
	};

	var run = function() {
		var videoID = elements.$backgroundVideo.data( 'video-id' );

		if ( videoID ) {
			isYTVideo = true;

			elementorFrontend.utils.onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			elements.$backgroundVideo.one( 'canplay', changeVideoSize );
		}
	};

	var init = function() {
		initElements();
		run();
	};

	init();
};

var StretchedSection = function( $section, $ ) {
	var elements = {},
		settings = {};

	var stretchSection = function() {
		// Clear any previously existing css associated with this script
		var direction = settings.is_rtl ? 'right' : 'left',
			resetCss = {},
            isStretched = $section.hasClass( 'elementor-section-stretched' );

		if ( elementorFrontend.isEditMode() || isStretched ) {
			resetCss.width = 'auto';

			resetCss[ direction ] = 0;

			$section.css( resetCss );
		}

		if ( ! isStretched ) {
			return;
		}

		var containerWidth = elements.$scopeWindow.outerWidth(),
			sectionWidth = $section.outerWidth(),
			sectionOffset = $section.offset().left,
			correctOffset = sectionOffset;

        if ( elements.$sectionContainer.length ) {
			var containerOffset = elements.$sectionContainer.offset().left;

			containerWidth = elements.$sectionContainer.outerWidth();

			if ( sectionOffset > containerOffset ) {
				correctOffset = sectionOffset - containerOffset;
			} else {
				correctOffset = 0;
			}
		}

		if ( settings.is_rtl ) {
			correctOffset = containerWidth - ( sectionWidth + correctOffset );
		}

		resetCss.width = containerWidth + 'px';

		resetCss[ direction ] = -correctOffset + 'px';

		$section.css( resetCss );
	};

	var initSettings = function() {
		settings.sectionContainerSelector = elementorFrontend.config.stretchedSectionContainer;
		settings.is_rtl = elementorFrontend.config.is_rtl;
	};

	var initElements = function() {
		elements.scopeWindow = elementorFrontend.getScopeWindow();
		elements.$scopeWindow = $( elements.scopeWindow );
		elements.$sectionContainer = $( elements.scopeWindow.document ).find( settings.sectionContainerSelector );
	};

	var bindEvents = function() {
		elementorFrontend.addListenerOnce( $section.data( 'model-cid' ), 'resize', stretchSection );
	};

	var init = function() {
		initSettings();
		initElements();
		bindEvents();
		stretchSection();
	};

	init();
};

module.exports = function( $scope, $ ) {
	new StretchedSection( $scope, $ );

	var $backgroundVideoContainer = $scope.find( '.elementor-background-video-container' );

	if ( $backgroundVideoContainer ) {
		new BackgroundVideo( $backgroundVideoContainer, $ );
	}
};

},{}],12:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var defaultActiveTab = $scope.find( '.elementor-tabs' ).data( 'active-tab' ),
		$tabsTitles = $scope.find( '.elementor-tab-title' ),
		$tabs = $scope.find( '.elementor-tab-content' ),
		$active,
		$content;

	if ( ! defaultActiveTab ) {
		defaultActiveTab = 1;
	}

	var activateTab = function( tabIndex ) {
		if ( $active ) {
			$active.removeClass( 'active' );

			$content.hide();
		}

		$active = $tabsTitles.filter( '[data-tab="' + tabIndex + '"]' );

		$active.addClass( 'active' );

		$content = $tabs.filter( '[data-tab="' + tabIndex + '"]' );

		$content.show();
	};

	activateTab( defaultActiveTab );

	$tabsTitles.on( 'click', function() {
		activateTab( this.dataset.tab );
	} );
};

},{}],13:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var $toggleTitles = $scope.find( '.elementor-toggle-title' );

	$toggleTitles.on( 'click', function() {
		var $active = $( this ),
			$content = $active.next();

		if ( $active.hasClass( 'active' ) ) {
			$active.removeClass( 'active' );
			$content.slideUp();
		} else {
			$active.addClass( 'active' );
			$content.slideDown();
		}
	} );
};

},{}],14:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	var $imageOverlay = $scope.find( '.elementor-custom-embed-image-overlay' ),
		$videoFrame = $scope.find( 'iframe' );

	if ( ! $imageOverlay.length ) {
		return;
	}

	$imageOverlay.on( 'click', function() {
		$imageOverlay.remove();
		var newSourceUrl = $videoFrame[0].src;
		// Remove old autoplay if exists
		newSourceUrl = newSourceUrl.replace( '&autoplay=0', '' );

		$videoFrame[0].src = newSourceUrl + '&autoplay=1';
	} );
};

},{}],15:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	if ( ! elementorFrontend.isEditMode() ) {
		return;
	}

	if ( $scope.hasClass( 'elementor-widget-edit-disabled' ) ) {
		return;
	}

	$scope.find( '.elementor-element' ).each( function() {
		elementorFrontend.elementsHandler.runReadyTrigger( $( this ) );
	} );
};

},{}],16:[function(require,module,exports){
var Utils;

Utils = function( $ ) {
	var self = this;

	// FIXME: Choose other variable name for this flag
	var isYTInserted = false;

	var insertYTApi = function() {
		isYTInserted = true;

		$( 'script:first' ).before(  $( '<script>', { src: 'https://www.youtube.com/iframe_api' } ) );
	};

	this.onYoutubeApiReady = function( callback ) {
		if ( ! isYTInserted ) {
			insertYTApi();
		}

		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				self.onYoutubeApiReady( callback );
			}, 350 );
		}
	};

	this.waypoint = function( $element, callback, options ) {
		var correctCallback = function() {
			var element = this.element || this;

			return callback.apply( element, arguments );
		};

		$element.elementorWaypoint( correctCallback, options );
	};
};

module.exports = Utils;

},{}],17:[function(require,module,exports){
'use strict';

/**
 * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
 * that, lowest priority hooks are fired first.
 */
var EventManager = function() {
	var slice = Array.prototype.slice,
		MethodsAvailable;

	/**
	 * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
	 * object literal such that looking up the hook utilizes the native object literal hash.
	 */
	var STORAGE = {
		actions: {},
		filters: {}
	};

	/**
	 * Removes the specified hook by resetting the value of it.
	 *
	 * @param type Type of hook, either 'actions' or 'filters'
	 * @param hook The hook (namespace.identifier) to remove
	 *
	 * @private
	 */
	function _removeHook( type, hook, callback, context ) {
		var handlers, handler, i;

		if ( ! STORAGE[ type ][ hook ] ) {
			return;
		}
		if ( ! callback ) {
			STORAGE[ type ][ hook ] = [];
		} else {
			handlers = STORAGE[ type ][ hook ];
			if ( ! context ) {
				for ( i = handlers.length; i--; ) {
					if ( handlers[ i ].callback === callback ) {
						handlers.splice( i, 1 );
					}
				}
			} else {
				for ( i = handlers.length; i--; ) {
					handler = handlers[ i ];
					if ( handler.callback === callback && handler.context === context ) {
						handlers.splice( i, 1 );
					}
				}
			}
		}
	}

	/**
	 * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
	 * than bubble sort, etc: http://jsperf.com/javascript-sort
	 *
	 * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
	 * @private
	 */
	function _hookInsertSort( hooks ) {
		var tmpHook, j, prevHook;
		for ( var i = 1, len = hooks.length; i < len; i++ ) {
			tmpHook = hooks[ i ];
			j = i;
			while ( ( prevHook = hooks[ j - 1 ] ) && prevHook.priority > tmpHook.priority ) {
				hooks[ j ] = hooks[ j - 1 ];
				--j;
			}
			hooks[ j ] = tmpHook;
		}

		return hooks;
	}

	/**
	 * Adds the hook to the appropriate storage container
	 *
	 * @param type 'actions' or 'filters'
	 * @param hook The hook (namespace.identifier) to add to our event manager
	 * @param callback The function that will be called when the hook is executed.
	 * @param priority The priority of this hook. Must be an integer.
	 * @param [context] A value to be used for this
	 * @private
	 */
	function _addHook( type, hook, callback, priority, context ) {
		var hookObject = {
			callback: callback,
			priority: priority,
			context: context
		};

		// Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
		var hooks = STORAGE[ type ][ hook ];
		if ( hooks ) {
			hooks.push( hookObject );
			hooks = _hookInsertSort( hooks );
		} else {
			hooks = [ hookObject ];
		}

		STORAGE[ type ][ hook ] = hooks;
	}

	/**
	 * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
	 *
	 * @param type 'actions' or 'filters'
	 * @param hook The hook ( namespace.identifier ) to be ran.
	 * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
	 * @private
	 */
	function _runHook( type, hook, args ) {
		var handlers = STORAGE[ type ][ hook ], i, len;

		if ( ! handlers ) {
			return ( 'filters' === type ) ? args[ 0 ] : false;
		}

		len = handlers.length;
		if ( 'filters' === type ) {
			for ( i = 0; i < len; i++ ) {
				args[ 0 ] = handlers[ i ].callback.apply( handlers[ i ].context, args );
			}
		} else {
			for ( i = 0; i < len; i++ ) {
				handlers[ i ].callback.apply( handlers[ i ].context, args );
			}
		}

		return ( 'filters' === type ) ? args[ 0 ] : true;
	}

	/**
	 * Adds an action to the event manager.
	 *
	 * @param action Must contain namespace.identifier
	 * @param callback Must be a valid callback function before this action is added
	 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
	 * @param [context] Supply a value to be used for this
	 */
	function addAction( action, callback, priority, context ) {
		if ( 'string' === typeof action && 'function' === typeof callback ) {
			priority = parseInt( ( priority || 10 ), 10 );
			_addHook( 'actions', action, callback, priority, context );
		}

		return MethodsAvailable;
	}

	/**
	 * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
	 * that the first argument must always be the action.
	 */
	function doAction( /* action, arg1, arg2, ... */ ) {
		var args = slice.call( arguments );
		var action = args.shift();

		if ( 'string' === typeof action ) {
			_runHook( 'actions', action, args );
		}

		return MethodsAvailable;
	}

	/**
	 * Removes the specified action if it contains a namespace.identifier & exists.
	 *
	 * @param action The action to remove
	 * @param [callback] Callback function to remove
	 */
	function removeAction( action, callback ) {
		if ( 'string' === typeof action ) {
			_removeHook( 'actions', action, callback );
		}

		return MethodsAvailable;
	}

	/**
	 * Adds a filter to the event manager.
	 *
	 * @param filter Must contain namespace.identifier
	 * @param callback Must be a valid callback function before this action is added
	 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
	 * @param [context] Supply a value to be used for this
	 */
	function addFilter( filter, callback, priority, context ) {
		if ( 'string' === typeof filter && 'function' === typeof callback ) {
			priority = parseInt( ( priority || 10 ), 10 );
			_addHook( 'filters', filter, callback, priority, context );
		}

		return MethodsAvailable;
	}

	/**
	 * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
	 * the first argument must always be the filter.
	 */
	function applyFilters( /* filter, filtered arg, arg2, ... */ ) {
		var args = slice.call( arguments );
		var filter = args.shift();

		if ( 'string' === typeof filter ) {
			return _runHook( 'filters', filter, args );
		}

		return MethodsAvailable;
	}

	/**
	 * Removes the specified filter if it contains a namespace.identifier & exists.
	 *
	 * @param filter The action to remove
	 * @param [callback] Callback function to remove
	 */
	function removeFilter( filter, callback ) {
		if ( 'string' === typeof filter ) {
			_removeHook( 'filters', filter, callback );
		}

		return MethodsAvailable;
	}

	/**
	 * Maintain a reference to the object scope so our public methods never get confusing.
	 */
	MethodsAvailable = {
		removeFilter: removeFilter,
		applyFilters: applyFilters,
		addFilter: addFilter,
		removeAction: removeAction,
		doAction: doAction,
		addAction: addAction
	};

	// return all of the publicly available methods
	return MethodsAvailable;
};

module.exports = EventManager;

},{}],18:[function(require,module,exports){
var Module = function() {
	var $ = jQuery,
		instanceParams = arguments,
		self = this,
		settings,
		elements,
		events = {};

	var ensureClosureMethods = function() {
		var closureMethodsNames = self.getClosureMethodsNames();

		$.each( closureMethodsNames, function() {
			var oldMethod = self[ this ];

			self[ this ] = function() {
				oldMethod.apply( self, arguments );
			};
		});
	};

	var initSettings = function() {
		settings = self.getDefaultSettings();
	};

	var initElements = function() {
		elements = self.getDefaultElements();
	};

	var init = function() {
		self.__construct.apply( self, instanceParams );

		ensureClosureMethods();

		initSettings();

		initElements();

		self.trigger( 'init' );
	};

	this.getItems = function( items, itemKey ) {
		if ( itemKey ) {
			var keyStack = itemKey.split( '.' ),
				currentKey = keyStack.splice( 0, 1 );

			if ( ! keyStack.length ) {
				return items[ currentKey ];
			}

			if ( ! items[ currentKey ] ) {
				return;
			}

			return this.getItems(  items[ currentKey ], keyStack.join( '.' ) );
		}

		return items;
	};

	this.getSettings = function( setting ) {
		return this.getItems( settings, setting );
	};

	this.getElements = function( element ) {
		return this.getItems( elements, element );
	};

	this.setSettings = function( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = settings;
		}

		if ( 'object' === typeof settingKey ) {
			$.extend( settingsContainer, settingKey );

			return self;
		}

		var keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return self;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return self.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	};

	this.addElement = function( elementName, $element ) {
		elements[ elementName ] = $element;
	};

	this.on = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			events[ eventName ] = [];
		}

		events[ eventName ].push( callback );

		return self;
	};

	this.off = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			return self;
		}

		if ( ! callback ) {
			delete events[ eventName ];

			return self;
		}

		var callbackIndex = events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete events[ eventName ][ callbackIndex ];
		}

		return self;
	};

	this.trigger = function( eventName ) {
		var methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( self[ methodName ] ) {
			self[ methodName ].apply( self, params );
		}

		var callbacks = events[ eventName ];

		if ( ! callbacks ) {
			return;
		}

		$.each( callbacks, function( index, callback ) {
			callback.apply( self, params );
		} );
	};

	init();
};

Module.prototype.__construct = function() {};

Module.prototype.getDefaultSettings = function() {
	return {};
};

Module.prototype.getDefaultElements = function() {
	return {};
};

Module.prototype.getClosureMethodsNames = function() {
	return [];
};

Module.extend = function( properties ) {
	var $ = jQuery,
		parent = this;

	var child = function() {
		return parent.apply( this, arguments );
	};

	$.extend( child, parent );

	child.prototype = Object.create( $.extend( {}, parent.prototype, properties ) );

	child.prototype.constructor = child;

	child.__super__ = parent.prototype;

	return child;
};

module.exports = Module;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2VsZW1lbnRzLWhhbmRsZXIuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2Zyb250ZW5kLW1vZHVsZS5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvZnJvbnRlbmQuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2FjY29yZGlvbi5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvYWxlcnQuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2NvdW50ZXIuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2dsb2JhbC5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvaW1hZ2UtY2Fyb3VzZWwuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL21lbnUtYW5jaG9yLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9wcm9ncmVzcy5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvc2VjdGlvbi5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdGFicy5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdG9nZ2xlLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy92aWRlby5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvd2lkZ2V0LmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC91dGlscy5qcyIsImFzc2V0cy9kZXYvanMvdXRpbHMvaG9va3MuanMiLCJhc3NldHMvZGV2L2pzL3V0aWxzL21vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEVsZW1lbnRzSGFuZGxlcjtcclxuXHJcbkVsZW1lbnRzSGFuZGxlciA9IGZ1bmN0aW9uKCAkICkge1xyXG5cdHZhciBzZWxmID0gdGhpcztcclxuXHJcblx0Ly8gZWxlbWVudC10eXBlLnNraW4tdHlwZVxyXG5cdHZhciBoYW5kbGVycyA9IHtcclxuXHRcdC8vIEVsZW1lbnRzXHJcblx0XHQnc2VjdGlvbic6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvc2VjdGlvbicgKSxcclxuXHJcblx0XHQvLyBXaWRnZXRzXHJcblx0XHQnYWNjb3JkaW9uLmRlZmF1bHQnOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2FjY29yZGlvbicgKSxcclxuXHRcdCdhbGVydC5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9hbGVydCcgKSxcclxuXHRcdCdjb3VudGVyLmRlZmF1bHQnOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2NvdW50ZXInICksXHJcblx0XHQncHJvZ3Jlc3MuZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvcHJvZ3Jlc3MnICksXHJcblx0XHQndGFicy5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy90YWJzJyApLFxyXG5cdFx0J3RvZ2dsZS5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy90b2dnbGUnICksXHJcblx0XHQndmlkZW8uZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvdmlkZW8nICksXHJcblx0XHQnaW1hZ2UtY2Fyb3VzZWwuZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvaW1hZ2UtY2Fyb3VzZWwnICksXHJcblx0XHQnbWVudS1hbmNob3IuZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvbWVudS1hbmNob3InIClcclxuXHR9O1xyXG5cclxuXHR2YXIgYWRkR2xvYmFsSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmFkZEFjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvZ2xvYmFsJywgcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9nbG9iYWwnICkgKTtcclxuXHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmFkZEFjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvd2lkZ2V0JywgcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy93aWRnZXQnICkgKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgYWRkRWxlbWVudHNIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0JC5lYWNoKCBoYW5kbGVycywgZnVuY3Rpb24oIGVsZW1lbnROYW1lLCBmdW5jQ2FsbGJhY2sgKSB7XHJcblx0XHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmFkZEFjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvJyArIGVsZW1lbnROYW1lLCBmdW5jQ2FsbGJhY2sgKTtcclxuXHRcdH0gKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgcnVuRWxlbWVudHNIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyICRlbGVtZW50cztcclxuXHJcblx0XHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcclxuXHRcdFx0Ly8gRWxlbWVudHMgb3V0c2lkZSBmcm9tIHRoZSBQcmV2aWV3XHJcblx0XHRcdCRlbGVtZW50cyA9IGVsZW1lbnRvckZyb250ZW5kLmdldFNjb3BlV2luZG93KCkualF1ZXJ5KCAnLmVsZW1lbnRvci1lbGVtZW50JywgJy5lbGVtZW50b3I6bm90KC5lbGVtZW50b3ItZWRpdC1tb2RlKScgKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdCRlbGVtZW50cyA9ICQoICcuZWxlbWVudG9yLWVsZW1lbnQnICk7XHJcblx0XHR9XHJcblxyXG5cdFx0JGVsZW1lbnRzLmVhY2goIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZWxmLnJ1blJlYWR5VHJpZ2dlciggJCggdGhpcyApICk7XHJcblx0XHR9ICk7XHJcblx0fTtcclxuXHJcblx0dmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmICggISBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgKSB7XHJcblx0XHRcdHNlbGYuaW5pdEhhbmRsZXJzKCk7XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0dGhpcy5pbml0SGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcclxuXHRcdGFkZEdsb2JhbEhhbmRsZXJzKCk7XHJcblxyXG5cdFx0YWRkRWxlbWVudHNIYW5kbGVycygpO1xyXG5cclxuXHRcdHJ1bkVsZW1lbnRzSGFuZGxlcnMoKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmdldEhhbmRsZXJzID0gZnVuY3Rpb24oIGhhbmRsZXJOYW1lICkge1xyXG5cdFx0aWYgKCBoYW5kbGVyTmFtZSApIHtcclxuXHRcdFx0cmV0dXJuIGhhbmRsZXJzWyBoYW5kbGVyTmFtZSBdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBoYW5kbGVycztcclxuXHR9O1xyXG5cclxuXHQvLyBUT0RPOiBUZW1wIGZhbGxiYWNrIG1ldGhvZCBmcm9tIDEuMi4wXHJcblx0dGhpcy5hZGRFeHRlcm5hbExpc3RlbmVyID0gZnVuY3Rpb24oICRzY29wZSwgZXZlbnQsIGNhbGxiYWNrLCBleHRlcm5hbEVsZW1lbnQgKSB7XHJcblx0XHRlbGVtZW50b3JGcm9udGVuZC5hZGRMaXN0ZW5lck9uY2UoICRzY29wZS5kYXRhKCAnbW9kZWwtY2lkJyApLCBldmVudCwgY2FsbGJhY2ssIGV4dGVybmFsRWxlbWVudCApO1xyXG5cdH07XHJcblxyXG5cdHRoaXMucnVuUmVhZHlUcmlnZ2VyID0gZnVuY3Rpb24oICRzY29wZSApIHtcclxuXHRcdHZhciBlbGVtZW50VHlwZSA9ICRzY29wZS5kYXRhKCAnZWxlbWVudF90eXBlJyApO1xyXG5cclxuXHRcdGlmICggISBlbGVtZW50VHlwZSApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmRvQWN0aW9uKCAnZnJvbnRlbmQvZWxlbWVudF9yZWFkeS9nbG9iYWwnLCAkc2NvcGUsICQgKTtcclxuXHJcblx0XHR2YXIgaXNXaWRnZXRUeXBlID0gKCAtMSA9PT0gWyAnc2VjdGlvbicsICdjb2x1bW4nIF0uaW5kZXhPZiggZWxlbWVudFR5cGUgKSApO1xyXG5cclxuXHRcdGlmICggaXNXaWRnZXRUeXBlICkge1xyXG5cdFx0XHRlbGVtZW50b3JGcm9udGVuZC5ob29rcy5kb0FjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvd2lkZ2V0JywgJHNjb3BlLCAkICk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuaG9va3MuZG9BY3Rpb24oICdmcm9udGVuZC9lbGVtZW50X3JlYWR5LycgKyBlbGVtZW50VHlwZSwgJHNjb3BlLCAkICk7XHJcblx0fTtcclxuXHJcblx0aW5pdCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50c0hhbmRsZXI7XHJcbiIsInZhciBNb2R1bGUgPSByZXF1aXJlKCAnLi4vdXRpbHMvbW9kdWxlJyApLFxyXG5cdEZyb250ZW5kTW9kdWxlO1xyXG5cclxuRnJvbnRlbmRNb2R1bGUgPSBNb2R1bGUuZXh0ZW5kKCB7XHJcblx0X19jb25zdHJ1Y3Q6IGZ1bmN0aW9uKCAkZWxlbWVudCApIHtcclxuXHRcdHRoaXMuJGVsZW1lbnQgID0gJGVsZW1lbnQ7XHJcblx0fSxcclxuXHJcblx0Z2V0TW9kZWxDSUQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJGVsZW1lbnQuZGF0YSggJ21vZGVsLWNpZCcgKTtcclxuXHR9LFxyXG5cclxuXHRnZXRFbGVtZW50U2V0dGluZ3M6IGZ1bmN0aW9uKCBzZXR0aW5nICkge1xyXG5cdFx0dmFyIGVsZW1lbnRTZXR0aW5ncztcclxuXHJcblx0XHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcclxuXHRcdFx0dmFyIHNldHRpbmdzID0gZWxlbWVudG9yRnJvbnRlbmQuY29uZmlnLmVsZW1lbnRzLmRhdGFbIHRoaXMuZ2V0TW9kZWxDSUQoKSBdLFxyXG5cdFx0XHRcdHNldHRpbmdzS2V5cyA9IGVsZW1lbnRvckZyb250ZW5kLmNvbmZpZy5lbGVtZW50cy5rZXlzWyBzZXR0aW5ncy53aWRnZXRUeXBlIF07XHJcblxyXG5cdFx0XHRlbGVtZW50U2V0dGluZ3MgPSBfLnBpY2soIHNldHRpbmdzLCBzZXR0aW5nc0tleXMgKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGVsZW1lbnRTZXR0aW5ncyA9IHRoaXMuJGVsZW1lbnQuZGF0YSggJ3NldHRpbmdzJyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLmdldEl0ZW1zKCBlbGVtZW50U2V0dGluZ3MsIHNldHRpbmcgKTtcclxuXHR9XHJcbn0gKTtcclxuXHJcbkZyb250ZW5kTW9kdWxlLnByb3RvdHlwZS5nZXRFbGVtZW50TmFtZSA9IGZ1bmN0aW9uKCkge307XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZyb250ZW5kTW9kdWxlO1xyXG4iLCIvKiBnbG9iYWwgZWxlbWVudG9yRnJvbnRlbmRDb25maWcgKi9cclxuKCBmdW5jdGlvbiggJCApIHtcclxuXHR2YXIgZWxlbWVudHMgPSB7fSxcclxuXHRcdEV2ZW50TWFuYWdlciA9IHJlcXVpcmUoICcuLi91dGlscy9ob29rcycgKSxcclxuXHRcdE1vZHVsZSA9IHJlcXVpcmUoICcuL2Zyb250ZW5kLW1vZHVsZScgKSxcclxuXHRcdEVsZW1lbnRzSGFuZGxlciA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvZWxlbWVudHMtaGFuZGxlcicgKSxcclxuXHQgICAgVXRpbHMgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL3V0aWxzJyApO1xyXG5cclxuXHR2YXIgRWxlbWVudG9yRnJvbnRlbmQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdFx0c2NvcGVXaW5kb3cgPSB3aW5kb3c7XHJcblxyXG5cdFx0dGhpcy5jb25maWcgPSBlbGVtZW50b3JGcm9udGVuZENvbmZpZztcclxuXHJcblx0XHR0aGlzLmhvb2tzID0gbmV3IEV2ZW50TWFuYWdlcigpO1xyXG5cclxuXHRcdHRoaXMuTW9kdWxlID0gTW9kdWxlO1xyXG5cclxuXHRcdHZhciBpbml0RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0ZWxlbWVudHMuJGRvY3VtZW50ID0gJCggc2VsZi5nZXRTY29wZVdpbmRvdygpLmRvY3VtZW50ICk7XHJcblxyXG5cdFx0XHRlbGVtZW50cy4kZWxlbWVudG9yID0gZWxlbWVudHMuJGRvY3VtZW50LmZpbmQoICcuZWxlbWVudG9yJyApO1xyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgaW5pdE9uUmVhZHlDb21wb25lbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYudXRpbHMgPSBuZXcgVXRpbHMoICQgKTtcclxuXHJcblx0XHRcdHNlbGYuZWxlbWVudHNIYW5kbGVyID0gbmV3IEVsZW1lbnRzSGFuZGxlciggJCApO1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aW5pdEVsZW1lbnRzKCk7XHJcblxyXG5cdFx0XHRpbml0T25SZWFkeUNvbXBvbmVudHMoKTtcclxuXHJcblx0XHRcdHNlbGYuaG9va3MuZG9BY3Rpb24oICdpbml0JyApO1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmdldFNjb3BlV2luZG93ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY29wZVdpbmRvdztcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5zZXRTY29wZVdpbmRvdyA9IGZ1bmN0aW9uKCB3aW5kb3cgKSB7XHJcblx0XHRcdHNjb3BlV2luZG93ID0gd2luZG93O1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmlzRWRpdE1vZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHNlbGYuY29uZmlnLmlzRWRpdE1vZGU7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIEJhc2VkIG9uIHVuZGVyc2NvcmUgZnVuY3Rpb25cclxuXHRcdHRoaXMudGhyb3R0bGUgPSBmdW5jdGlvbiggZnVuYywgd2FpdCApIHtcclxuXHRcdFx0dmFyIHRpbWVvdXQsXHJcblx0XHRcdFx0Y29udGV4dCxcclxuXHRcdFx0XHRhcmdzLFxyXG5cdFx0XHRcdHJlc3VsdCxcclxuXHRcdFx0XHRwcmV2aW91cyA9IDA7XHJcblxyXG5cdFx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRwcmV2aW91cyA9IERhdGUubm93KCk7XHJcblx0XHRcdFx0dGltZW91dCA9IG51bGw7XHJcblx0XHRcdFx0cmVzdWx0ID0gZnVuYy5hcHBseSggY29udGV4dCwgYXJncyApO1xyXG5cclxuXHRcdFx0XHRpZiAoICEgdGltZW91dCApIHtcclxuXHRcdFx0XHRcdGNvbnRleHQgPSBhcmdzID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIG5vdyA9IERhdGUubm93KCksXHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSB3YWl0IC0gKCBub3cgLSBwcmV2aW91cyApO1xyXG5cclxuXHRcdFx0XHRjb250ZXh0ID0gdGhpcztcclxuXHRcdFx0XHRhcmdzID0gYXJndW1lbnRzO1xyXG5cclxuXHRcdFx0XHRpZiAoIHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQgKSB7XHJcblx0XHRcdFx0XHRpZiAoIHRpbWVvdXQgKSB7XHJcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCggdGltZW91dCApO1xyXG5cdFx0XHRcdFx0XHR0aW1lb3V0ID0gbnVsbDtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRwcmV2aW91cyA9IG5vdztcclxuXHRcdFx0XHRcdHJlc3VsdCA9IGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoICEgdGltZW91dCApIHtcclxuXHRcdFx0XHRcdFx0Y29udGV4dCA9IGFyZ3MgPSBudWxsO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSBpZiAoICEgdGltZW91dCApIHtcclxuXHRcdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KCBsYXRlciwgcmVtYWluaW5nICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0XHR9O1xyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLmFkZExpc3RlbmVyT25jZSA9IGZ1bmN0aW9uKCBsaXN0ZW5lcklELCBldmVudCwgY2FsbGJhY2ssIHRvICkge1xyXG5cdFx0XHRpZiAoICEgdG8gKSB7XHJcblx0XHRcdFx0dG8gPSAkKCBzZWxmLmdldFNjb3BlV2luZG93KCkgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKCAhIHNlbGYuaXNFZGl0TW9kZSgpICkge1xyXG5cdFx0XHRcdHRvLm9uKCBldmVudCwgY2FsbGJhY2sgKTtcclxuXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoIHRvIGluc3RhbmNlb2YgalF1ZXJ5ICkge1xyXG5cdFx0XHRcdHZhciBldmVudE5TID0gZXZlbnQgKyAnLicgKyBsaXN0ZW5lcklEO1xyXG5cclxuXHRcdFx0XHR0by5vZmYoIGV2ZW50TlMgKS5vbiggZXZlbnROUywgY2FsbGJhY2sgKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0by5vZmYoIGV2ZW50LCBudWxsLCBsaXN0ZW5lcklEICkub24oIGV2ZW50LCBjYWxsYmFjaywgbGlzdGVuZXJJRCApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuZ2V0Q3VycmVudERldmljZU1vZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIGdldENvbXB1dGVkU3R5bGUoIGVsZW1lbnRzLiRlbGVtZW50b3JbIDAgXSwgJzphZnRlcicgKS5jb250ZW50LnJlcGxhY2UoIC9cIi9nLCAnJyApO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHR3aW5kb3cuZWxlbWVudG9yRnJvbnRlbmQgPSBuZXcgRWxlbWVudG9yRnJvbnRlbmQoKTtcclxufSApKCBqUXVlcnkgKTtcclxuXHJcbmlmICggISBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgKSB7XHJcblx0alF1ZXJ5KCBlbGVtZW50b3JGcm9udGVuZC5pbml0ICk7XHJcbn1cclxuIiwidmFyIGFjdGl2YXRlU2VjdGlvbiA9IGZ1bmN0aW9uKCBzZWN0aW9uSW5kZXgsICRhY2NvcmRpb25UaXRsZXMgKSB7XHJcblx0dmFyICRhY3RpdmVUaXRsZSA9ICRhY2NvcmRpb25UaXRsZXMuZmlsdGVyKCAnLmFjdGl2ZScgKSxcclxuXHRcdCRyZXF1ZXN0ZWRUaXRsZSA9ICRhY2NvcmRpb25UaXRsZXMuZmlsdGVyKCAnW2RhdGEtc2VjdGlvbj1cIicgKyBzZWN0aW9uSW5kZXggKyAnXCJdJyApLFxyXG5cdFx0aXNSZXF1ZXN0ZWRBY3RpdmUgPSAkcmVxdWVzdGVkVGl0bGUuaGFzQ2xhc3MoICdhY3RpdmUnICk7XHJcblxyXG5cdCRhY3RpdmVUaXRsZVxyXG5cdFx0LnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApXHJcblx0XHQubmV4dCgpXHJcblx0XHQuc2xpZGVVcCgpO1xyXG5cclxuXHRpZiAoICEgaXNSZXF1ZXN0ZWRBY3RpdmUgKSB7XHJcblx0XHQkcmVxdWVzdGVkVGl0bGVcclxuXHRcdFx0LmFkZENsYXNzKCAnYWN0aXZlJyApXHJcblx0XHRcdC5uZXh0KClcclxuXHRcdFx0LnNsaWRlRG93bigpO1xyXG5cdH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSwgJCApIHtcclxuXHR2YXIgZGVmYXVsdEFjdGl2ZVNlY3Rpb24gPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItYWNjb3JkaW9uJyApLmRhdGEoICdhY3RpdmUtc2VjdGlvbicgKSxcclxuXHRcdCRhY2NvcmRpb25UaXRsZXMgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItYWNjb3JkaW9uLXRpdGxlJyApO1xyXG5cclxuXHRpZiAoICEgZGVmYXVsdEFjdGl2ZVNlY3Rpb24gKSB7XHJcblx0XHRkZWZhdWx0QWN0aXZlU2VjdGlvbiA9IDE7XHJcblx0fVxyXG5cclxuXHRhY3RpdmF0ZVNlY3Rpb24oIGRlZmF1bHRBY3RpdmVTZWN0aW9uLCAkYWNjb3JkaW9uVGl0bGVzICk7XHJcblxyXG5cdCRhY2NvcmRpb25UaXRsZXMub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0YWN0aXZhdGVTZWN0aW9uKCB0aGlzLmRhdGFzZXQuc2VjdGlvbiwgJGFjY29yZGlvblRpdGxlcyApO1xyXG5cdH0gKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlLCAkICkge1xyXG5cdCRzY29wZS5maW5kKCAnLmVsZW1lbnRvci1hbGVydC1kaXNtaXNzJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdCQoIHRoaXMgKS5wYXJlbnQoKS5mYWRlT3V0KCk7XHJcblx0fSApO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XHJcblx0ZWxlbWVudG9yRnJvbnRlbmQudXRpbHMud2F5cG9pbnQoICRzY29wZS5maW5kKCAnLmVsZW1lbnRvci1jb3VudGVyLW51bWJlcicgKSwgZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgJG51bWJlciA9ICQoIHRoaXMgKSxcclxuXHRcdFx0ZGF0YSA9ICRudW1iZXIuZGF0YSgpO1xyXG5cclxuXHRcdHZhciBkZWNpbWFsRGlnaXRzID0gZGF0YS50b1ZhbHVlLnRvU3RyaW5nKCkubWF0Y2goIC9cXC4oLiopLyApO1xyXG5cclxuXHRcdGlmICggZGVjaW1hbERpZ2l0cyApIHtcclxuXHRcdFx0ZGF0YS5yb3VuZGluZyA9IGRlY2ltYWxEaWdpdHNbMV0ubGVuZ3RoO1xyXG5cdFx0fVxyXG5cclxuXHRcdCRudW1iZXIubnVtZXJhdG9yKCBkYXRhICk7XHJcblx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlLCAkICkge1xyXG5cdGlmICggZWxlbWVudG9yRnJvbnRlbmQuaXNFZGl0TW9kZSgpICkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0dmFyIGFuaW1hdGlvbiA9ICRzY29wZS5kYXRhKCAnYW5pbWF0aW9uJyApO1xyXG5cclxuXHRpZiAoICEgYW5pbWF0aW9uICkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0JHNjb3BlLmFkZENsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZScgKS5yZW1vdmVDbGFzcyggYW5pbWF0aW9uICk7XHJcblxyXG5cdGVsZW1lbnRvckZyb250ZW5kLnV0aWxzLndheXBvaW50KCAkc2NvcGUsIGZ1bmN0aW9uKCkge1xyXG5cdFx0JHNjb3BlLnJlbW92ZUNsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZScgKS5hZGRDbGFzcyggJ2FuaW1hdGVkICcgKyBhbmltYXRpb24gKTtcclxuXHR9LCB7IG9mZnNldDogJzkwJScgfSApO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XHJcblx0dmFyICRjYXJvdXNlbCA9ICRzY29wZS5maW5kKCAnLmVsZW1lbnRvci1pbWFnZS1jYXJvdXNlbCcgKTtcclxuXHRpZiAoICEgJGNhcm91c2VsLmxlbmd0aCApIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdHZhciBzYXZlZE9wdGlvbnMgPSAkY2Fyb3VzZWwuZGF0YSggJ3NsaWRlcl9vcHRpb25zJyApLFxyXG5cdFx0dGFibGV0U2xpZGVzID0gMSA9PT0gc2F2ZWRPcHRpb25zLnNsaWRlc1RvU2hvdyA/IDEgOiAyLFxyXG5cdFx0ZGVmYXVsdE9wdGlvbnMgPSB7XHJcblx0XHRcdHJlc3BvbnNpdmU6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRicmVha3BvaW50OiA3NjcsXHJcblx0XHRcdFx0XHRzZXR0aW5nczoge1xyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IHRhYmxldFNsaWRlcyxcclxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IHRhYmxldFNsaWRlc1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YnJlYWtwb2ludDogNDgwLFxyXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcclxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAxLFxyXG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Njcm9sbDogMVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XVxyXG5cdFx0fSxcclxuXHJcblx0XHRzbGlja09wdGlvbnMgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRPcHRpb25zLCAkY2Fyb3VzZWwuZGF0YSggJ3NsaWRlcl9vcHRpb25zJyApICk7XHJcblxyXG5cdCRjYXJvdXNlbC5zbGljayggc2xpY2tPcHRpb25zICk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSwgJCApIHtcclxuXHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdHZhciAkYW5jaG9yID0gJHNjb3BlLmZpbmQoICcuZWxlbWVudG9yLW1lbnUtYW5jaG9yJyApLFxyXG5cdFx0YW5jaG9ySUQgPSAkYW5jaG9yLmF0dHIoICdpZCcgKSxcclxuXHRcdCRhbmNob3JMaW5rcyA9ICQoICdhW2hyZWYqPVwiIycgKyBhbmNob3JJRCArICdcIl0nICksXHJcblx0XHQkc2Nyb2xsYWJsZSA9ICQoICdodG1sLCBib2R5JyApLFxyXG5cdFx0YWRtaW5CYXJIZWlnaHQgPSAkKCAnI3dwYWRtaW5iYXInICkuaGVpZ2h0KCk7XHJcblxyXG5cdCRhbmNob3JMaW5rcy5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xyXG5cdFx0dmFyIGlzU2FtZVBhdGhuYW1lID0gKCBsb2NhdGlvbi5wYXRobmFtZSA9PT0gdGhpcy5wYXRobmFtZSApLFxyXG5cdFx0XHRpc1NhbWVIb3N0bmFtZSA9ICggbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUgKTtcclxuXHJcblx0XHRpZiAoICEgaXNTYW1lSG9zdG5hbWUgfHwgISBpc1NhbWVQYXRobmFtZSApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0dmFyIHNjcm9sbFRvcCA9ICRhbmNob3Iub2Zmc2V0KCkudG9wIC0gYWRtaW5CYXJIZWlnaHQ7XHJcblxyXG5cdFx0c2Nyb2xsVG9wID0gZWxlbWVudG9yRnJvbnRlbmQuaG9va3MuYXBwbHlGaWx0ZXJzKCAnZnJvbnRlbmQvaGFuZGxlcnMvbWVudV9hbmNob3Ivc2Nyb2xsX3RvcF9kaXN0YW5jZScsIHNjcm9sbFRvcCApO1xyXG5cclxuXHRcdCRzY3JvbGxhYmxlLmFuaW1hdGUoIHtcclxuXHRcdFx0c2Nyb2xsVG9wOiBzY3JvbGxUb3BcclxuXHRcdH0sIDEwMDAgKTtcclxuXHR9ICk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSwgJCApIHtcclxuXHRlbGVtZW50b3JGcm9udGVuZC51dGlscy53YXlwb2ludCggJHNjb3BlLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLWJhcicgKSwgZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgJHByb2dyZXNzYmFyID0gJCggdGhpcyApO1xyXG5cclxuXHRcdCRwcm9ncmVzc2Jhci5jc3MoICd3aWR0aCcsICRwcm9ncmVzc2Jhci5kYXRhKCAnbWF4JyApICsgJyUnICk7XHJcblx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcclxufTtcclxuIiwidmFyIEJhY2tncm91bmRWaWRlbyA9IGZ1bmN0aW9uKCAkYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLCAkICkge1xyXG5cdHZhciBwbGF5ZXIsXHJcblx0XHRlbGVtZW50cyA9IHt9LFxyXG5cdFx0aXNZVFZpZGVvID0gZmFsc2U7XHJcblxyXG5cdHZhciBjYWxjVmlkZW9zU2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGNvbnRhaW5lcldpZHRoID0gJGJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5vdXRlcldpZHRoKCksXHJcblx0XHRcdGNvbnRhaW5lckhlaWdodCA9ICRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIub3V0ZXJIZWlnaHQoKSxcclxuXHRcdFx0YXNwZWN0UmF0aW9TZXR0aW5nID0gJzE2OjknLCAvL1RFTVBcclxuXHRcdFx0YXNwZWN0UmF0aW9BcnJheSA9IGFzcGVjdFJhdGlvU2V0dGluZy5zcGxpdCggJzonICksXHJcblx0XHRcdGFzcGVjdFJhdGlvID0gYXNwZWN0UmF0aW9BcnJheVsgMCBdIC8gYXNwZWN0UmF0aW9BcnJheVsgMSBdLFxyXG5cdFx0XHRyYXRpb1dpZHRoID0gY29udGFpbmVyV2lkdGggLyBhc3BlY3RSYXRpbyxcclxuXHRcdFx0cmF0aW9IZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKiBhc3BlY3RSYXRpbyxcclxuXHRcdFx0aXNXaWR0aEZpeGVkID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHQgPiBhc3BlY3RSYXRpbztcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR3aWR0aDogaXNXaWR0aEZpeGVkID8gY29udGFpbmVyV2lkdGggOiByYXRpb0hlaWdodCxcclxuXHRcdFx0aGVpZ2h0OiBpc1dpZHRoRml4ZWQgPyByYXRpb1dpZHRoIDogY29udGFpbmVySGVpZ2h0XHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdHZhciBjaGFuZ2VWaWRlb1NpemUgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciAkdmlkZW8gPSBpc1lUVmlkZW8gPyAkKCBwbGF5ZXIuZ2V0SWZyYW1lKCkgKSA6IGVsZW1lbnRzLiRiYWNrZ3JvdW5kVmlkZW8sXHJcblx0XHRcdHNpemUgPSBjYWxjVmlkZW9zU2l6ZSgpO1xyXG5cclxuXHRcdCR2aWRlby53aWR0aCggc2l6ZS53aWR0aCApLmhlaWdodCggc2l6ZS5oZWlnaHQgKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgcHJlcGFyZVlUVmlkZW8gPSBmdW5jdGlvbiggWVQsIHZpZGVvSUQgKSB7XHJcblx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCBlbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvWyAwIF0sIHtcclxuXHRcdFx0dmlkZW9JZDogdmlkZW9JRCxcclxuXHRcdFx0ZXZlbnRzOiB7XHJcblx0XHRcdFx0b25SZWFkeTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRwbGF5ZXIubXV0ZSgpO1xyXG5cclxuXHRcdFx0XHRcdGNoYW5nZVZpZGVvU2l6ZSgpO1xyXG5cclxuXHRcdFx0XHRcdHBsYXllci5wbGF5VmlkZW8oKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdG9uU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKCBldmVudCApIHtcclxuXHRcdFx0XHRcdGlmICggZXZlbnQuZGF0YSA9PT0gWVQuUGxheWVyU3RhdGUuRU5ERUQgKSB7XHJcblx0XHRcdFx0XHRcdHBsYXllci5zZWVrVG8oIDAgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHBsYXllclZhcnM6IHtcclxuXHRcdFx0XHRjb250cm9sczogMCxcclxuXHRcdFx0XHRzaG93aW5mbzogMFxyXG5cdFx0XHR9XHJcblx0XHR9ICk7XHJcblxyXG5cdFx0JCggZWxlbWVudG9yRnJvbnRlbmQuZ2V0U2NvcGVXaW5kb3coKSApLm9uKCAncmVzaXplJywgY2hhbmdlVmlkZW9TaXplICk7XHJcblx0fTtcclxuXHJcblx0dmFyIGluaXRFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0ZWxlbWVudHMuJGJhY2tncm91bmRWaWRlbyA9ICRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIuY2hpbGRyZW4oICcuZWxlbWVudG9yLWJhY2tncm91bmQtdmlkZW8nICk7XHJcblx0fTtcclxuXHJcblx0dmFyIHJ1biA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHZpZGVvSUQgPSBlbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvLmRhdGEoICd2aWRlby1pZCcgKTtcclxuXHJcblx0XHRpZiAoIHZpZGVvSUQgKSB7XHJcblx0XHRcdGlzWVRWaWRlbyA9IHRydWU7XHJcblxyXG5cdFx0XHRlbGVtZW50b3JGcm9udGVuZC51dGlscy5vbllvdXR1YmVBcGlSZWFkeSggZnVuY3Rpb24oIFlUICkge1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0cHJlcGFyZVlUVmlkZW8oIFlULCB2aWRlb0lEICk7XHJcblx0XHRcdFx0fSwgMSApO1xyXG5cdFx0XHR9ICk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvLm9uZSggJ2NhbnBsYXknLCBjaGFuZ2VWaWRlb1NpemUgKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aW5pdEVsZW1lbnRzKCk7XHJcblx0XHRydW4oKTtcclxuXHR9O1xyXG5cclxuXHRpbml0KCk7XHJcbn07XHJcblxyXG52YXIgU3RyZXRjaGVkU2VjdGlvbiA9IGZ1bmN0aW9uKCAkc2VjdGlvbiwgJCApIHtcclxuXHR2YXIgZWxlbWVudHMgPSB7fSxcclxuXHRcdHNldHRpbmdzID0ge307XHJcblxyXG5cdHZhciBzdHJldGNoU2VjdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gQ2xlYXIgYW55IHByZXZpb3VzbHkgZXhpc3RpbmcgY3NzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHNjcmlwdFxyXG5cdFx0dmFyIGRpcmVjdGlvbiA9IHNldHRpbmdzLmlzX3J0bCA/ICdyaWdodCcgOiAnbGVmdCcsXHJcblx0XHRcdHJlc2V0Q3NzID0ge30sXHJcbiAgICAgICAgICAgIGlzU3RyZXRjaGVkID0gJHNlY3Rpb24uaGFzQ2xhc3MoICdlbGVtZW50b3Itc2VjdGlvbi1zdHJldGNoZWQnICk7XHJcblxyXG5cdFx0aWYgKCBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgfHwgaXNTdHJldGNoZWQgKSB7XHJcblx0XHRcdHJlc2V0Q3NzLndpZHRoID0gJ2F1dG8nO1xyXG5cclxuXHRcdFx0cmVzZXRDc3NbIGRpcmVjdGlvbiBdID0gMDtcclxuXHJcblx0XHRcdCRzZWN0aW9uLmNzcyggcmVzZXRDc3MgKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICEgaXNTdHJldGNoZWQgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY29udGFpbmVyV2lkdGggPSBlbGVtZW50cy4kc2NvcGVXaW5kb3cub3V0ZXJXaWR0aCgpLFxyXG5cdFx0XHRzZWN0aW9uV2lkdGggPSAkc2VjdGlvbi5vdXRlcldpZHRoKCksXHJcblx0XHRcdHNlY3Rpb25PZmZzZXQgPSAkc2VjdGlvbi5vZmZzZXQoKS5sZWZ0LFxyXG5cdFx0XHRjb3JyZWN0T2Zmc2V0ID0gc2VjdGlvbk9mZnNldDtcclxuXHJcbiAgICAgICAgaWYgKCBlbGVtZW50cy4kc2VjdGlvbkNvbnRhaW5lci5sZW5ndGggKSB7XHJcblx0XHRcdHZhciBjb250YWluZXJPZmZzZXQgPSBlbGVtZW50cy4kc2VjdGlvbkNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0O1xyXG5cclxuXHRcdFx0Y29udGFpbmVyV2lkdGggPSBlbGVtZW50cy4kc2VjdGlvbkNvbnRhaW5lci5vdXRlcldpZHRoKCk7XHJcblxyXG5cdFx0XHRpZiAoIHNlY3Rpb25PZmZzZXQgPiBjb250YWluZXJPZmZzZXQgKSB7XHJcblx0XHRcdFx0Y29ycmVjdE9mZnNldCA9IHNlY3Rpb25PZmZzZXQgLSBjb250YWluZXJPZmZzZXQ7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Y29ycmVjdE9mZnNldCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHNldHRpbmdzLmlzX3J0bCApIHtcclxuXHRcdFx0Y29ycmVjdE9mZnNldCA9IGNvbnRhaW5lcldpZHRoIC0gKCBzZWN0aW9uV2lkdGggKyBjb3JyZWN0T2Zmc2V0ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmVzZXRDc3Mud2lkdGggPSBjb250YWluZXJXaWR0aCArICdweCc7XHJcblxyXG5cdFx0cmVzZXRDc3NbIGRpcmVjdGlvbiBdID0gLWNvcnJlY3RPZmZzZXQgKyAncHgnO1xyXG5cclxuXHRcdCRzZWN0aW9uLmNzcyggcmVzZXRDc3MgKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgaW5pdFNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRzZXR0aW5ncy5zZWN0aW9uQ29udGFpbmVyU2VsZWN0b3IgPSBlbGVtZW50b3JGcm9udGVuZC5jb25maWcuc3RyZXRjaGVkU2VjdGlvbkNvbnRhaW5lcjtcclxuXHRcdHNldHRpbmdzLmlzX3J0bCA9IGVsZW1lbnRvckZyb250ZW5kLmNvbmZpZy5pc19ydGw7XHJcblx0fTtcclxuXHJcblx0dmFyIGluaXRFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0ZWxlbWVudHMuc2NvcGVXaW5kb3cgPSBlbGVtZW50b3JGcm9udGVuZC5nZXRTY29wZVdpbmRvdygpO1xyXG5cdFx0ZWxlbWVudHMuJHNjb3BlV2luZG93ID0gJCggZWxlbWVudHMuc2NvcGVXaW5kb3cgKTtcclxuXHRcdGVsZW1lbnRzLiRzZWN0aW9uQ29udGFpbmVyID0gJCggZWxlbWVudHMuc2NvcGVXaW5kb3cuZG9jdW1lbnQgKS5maW5kKCBzZXR0aW5ncy5zZWN0aW9uQ29udGFpbmVyU2VsZWN0b3IgKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuYWRkTGlzdGVuZXJPbmNlKCAkc2VjdGlvbi5kYXRhKCAnbW9kZWwtY2lkJyApLCAncmVzaXplJywgc3RyZXRjaFNlY3Rpb24gKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aW5pdFNldHRpbmdzKCk7XHJcblx0XHRpbml0RWxlbWVudHMoKTtcclxuXHRcdGJpbmRFdmVudHMoKTtcclxuXHRcdHN0cmV0Y2hTZWN0aW9uKCk7XHJcblx0fTtcclxuXHJcblx0aW5pdCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlLCAkICkge1xyXG5cdG5ldyBTdHJldGNoZWRTZWN0aW9uKCAkc2NvcGUsICQgKTtcclxuXHJcblx0dmFyICRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlby1jb250YWluZXInICk7XHJcblxyXG5cdGlmICggJGJhY2tncm91bmRWaWRlb0NvbnRhaW5lciApIHtcclxuXHRcdG5ldyBCYWNrZ3JvdW5kVmlkZW8oICRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIsICQgKTtcclxuXHR9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSwgJCApIHtcclxuXHR2YXIgZGVmYXVsdEFjdGl2ZVRhYiA9ICRzY29wZS5maW5kKCAnLmVsZW1lbnRvci10YWJzJyApLmRhdGEoICdhY3RpdmUtdGFiJyApLFxyXG5cdFx0JHRhYnNUaXRsZXMgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItdGFiLXRpdGxlJyApLFxyXG5cdFx0JHRhYnMgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItdGFiLWNvbnRlbnQnICksXHJcblx0XHQkYWN0aXZlLFxyXG5cdFx0JGNvbnRlbnQ7XHJcblxyXG5cdGlmICggISBkZWZhdWx0QWN0aXZlVGFiICkge1xyXG5cdFx0ZGVmYXVsdEFjdGl2ZVRhYiA9IDE7XHJcblx0fVxyXG5cclxuXHR2YXIgYWN0aXZhdGVUYWIgPSBmdW5jdGlvbiggdGFiSW5kZXggKSB7XHJcblx0XHRpZiAoICRhY3RpdmUgKSB7XHJcblx0XHRcdCRhY3RpdmUucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XHJcblxyXG5cdFx0XHQkY29udGVudC5oaWRlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JGFjdGl2ZSA9ICR0YWJzVGl0bGVzLmZpbHRlciggJ1tkYXRhLXRhYj1cIicgKyB0YWJJbmRleCArICdcIl0nICk7XHJcblxyXG5cdFx0JGFjdGl2ZS5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcclxuXHJcblx0XHQkY29udGVudCA9ICR0YWJzLmZpbHRlciggJ1tkYXRhLXRhYj1cIicgKyB0YWJJbmRleCArICdcIl0nICk7XHJcblxyXG5cdFx0JGNvbnRlbnQuc2hvdygpO1xyXG5cdH07XHJcblxyXG5cdGFjdGl2YXRlVGFiKCBkZWZhdWx0QWN0aXZlVGFiICk7XHJcblxyXG5cdCR0YWJzVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdGFjdGl2YXRlVGFiKCB0aGlzLmRhdGFzZXQudGFiICk7XHJcblx0fSApO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XHJcblx0dmFyICR0b2dnbGVUaXRsZXMgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItdG9nZ2xlLXRpdGxlJyApO1xyXG5cclxuXHQkdG9nZ2xlVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdHZhciAkYWN0aXZlID0gJCggdGhpcyApLFxyXG5cdFx0XHQkY29udGVudCA9ICRhY3RpdmUubmV4dCgpO1xyXG5cclxuXHRcdGlmICggJGFjdGl2ZS5oYXNDbGFzcyggJ2FjdGl2ZScgKSApIHtcclxuXHRcdFx0JGFjdGl2ZS5yZW1vdmVDbGFzcyggJ2FjdGl2ZScgKTtcclxuXHRcdFx0JGNvbnRlbnQuc2xpZGVVcCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JGFjdGl2ZS5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcclxuXHRcdFx0JGNvbnRlbnQuc2xpZGVEb3duKCk7XHJcblx0XHR9XHJcblx0fSApO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XHJcblx0dmFyICRpbWFnZU92ZXJsYXkgPSAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItY3VzdG9tLWVtYmVkLWltYWdlLW92ZXJsYXknICksXHJcblx0XHQkdmlkZW9GcmFtZSA9ICRzY29wZS5maW5kKCAnaWZyYW1lJyApO1xyXG5cclxuXHRpZiAoICEgJGltYWdlT3ZlcmxheS5sZW5ndGggKSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHQkaW1hZ2VPdmVybGF5Lm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcclxuXHRcdCRpbWFnZU92ZXJsYXkucmVtb3ZlKCk7XHJcblx0XHR2YXIgbmV3U291cmNlVXJsID0gJHZpZGVvRnJhbWVbMF0uc3JjO1xyXG5cdFx0Ly8gUmVtb3ZlIG9sZCBhdXRvcGxheSBpZiBleGlzdHNcclxuXHRcdG5ld1NvdXJjZVVybCA9IG5ld1NvdXJjZVVybC5yZXBsYWNlKCAnJmF1dG9wbGF5PTAnLCAnJyApO1xyXG5cclxuXHRcdCR2aWRlb0ZyYW1lWzBdLnNyYyA9IG5ld1NvdXJjZVVybCArICcmYXV0b3BsYXk9MSc7XHJcblx0fSApO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XHJcblx0aWYgKCAhIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblxyXG5cdGlmICggJHNjb3BlLmhhc0NsYXNzKCAnZWxlbWVudG9yLXdpZGdldC1lZGl0LWRpc2FibGVkJyApICkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0JHNjb3BlLmZpbmQoICcuZWxlbWVudG9yLWVsZW1lbnQnICkuZWFjaCggZnVuY3Rpb24oKSB7XHJcblx0XHRlbGVtZW50b3JGcm9udGVuZC5lbGVtZW50c0hhbmRsZXIucnVuUmVhZHlUcmlnZ2VyKCAkKCB0aGlzICkgKTtcclxuXHR9ICk7XHJcbn07XHJcbiIsInZhciBVdGlscztcclxuXHJcblV0aWxzID0gZnVuY3Rpb24oICQgKSB7XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHQvLyBGSVhNRTogQ2hvb3NlIG90aGVyIHZhcmlhYmxlIG5hbWUgZm9yIHRoaXMgZmxhZ1xyXG5cdHZhciBpc1lUSW5zZXJ0ZWQgPSBmYWxzZTtcclxuXHJcblx0dmFyIGluc2VydFlUQXBpID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpc1lUSW5zZXJ0ZWQgPSB0cnVlO1xyXG5cclxuXHRcdCQoICdzY3JpcHQ6Zmlyc3QnICkuYmVmb3JlKCAgJCggJzxzY3JpcHQ+JywgeyBzcmM6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpJyB9ICkgKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLm9uWW91dHViZUFwaVJlYWR5ID0gZnVuY3Rpb24oIGNhbGxiYWNrICkge1xyXG5cdFx0aWYgKCAhIGlzWVRJbnNlcnRlZCApIHtcclxuXHRcdFx0aW5zZXJ0WVRBcGkoKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoIHdpbmRvdy5ZVCAmJiBZVC5sb2FkZWQgKSB7XHJcblx0XHRcdGNhbGxiYWNrKCBZVCApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gSWYgbm90IHJlYWR5IGNoZWNrIGFnYWluIGJ5IHRpbWVvdXQuLlxyXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzZWxmLm9uWW91dHViZUFwaVJlYWR5KCBjYWxsYmFjayApO1xyXG5cdFx0XHR9LCAzNTAgKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHR0aGlzLndheXBvaW50ID0gZnVuY3Rpb24oICRlbGVtZW50LCBjYWxsYmFjaywgb3B0aW9ucyApIHtcclxuXHRcdHZhciBjb3JyZWN0Q2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQgfHwgdGhpcztcclxuXHJcblx0XHRcdHJldHVybiBjYWxsYmFjay5hcHBseSggZWxlbWVudCwgYXJndW1lbnRzICk7XHJcblx0XHR9O1xyXG5cclxuXHRcdCRlbGVtZW50LmVsZW1lbnRvcldheXBvaW50KCBjb3JyZWN0Q2FsbGJhY2ssIG9wdGlvbnMgKTtcclxuXHR9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVdGlscztcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIEhhbmRsZXMgbWFuYWdpbmcgYWxsIGV2ZW50cyBmb3Igd2hhdGV2ZXIgeW91IHBsdWcgaXQgaW50by4gUHJpb3JpdGllcyBmb3IgaG9va3MgYXJlIGJhc2VkIG9uIGxvd2VzdCB0byBoaWdoZXN0IGluXHJcbiAqIHRoYXQsIGxvd2VzdCBwcmlvcml0eSBob29rcyBhcmUgZmlyZWQgZmlyc3QuXHJcbiAqL1xyXG52YXIgRXZlbnRNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XHJcblx0dmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLFxyXG5cdFx0TWV0aG9kc0F2YWlsYWJsZTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29udGFpbnMgdGhlIGhvb2tzIHRoYXQgZ2V0IHJlZ2lzdGVyZWQgd2l0aCB0aGlzIEV2ZW50TWFuYWdlci4gVGhlIGFycmF5IGZvciBzdG9yYWdlIHV0aWxpemVzIGEgXCJmbGF0XCJcclxuXHQgKiBvYmplY3QgbGl0ZXJhbCBzdWNoIHRoYXQgbG9va2luZyB1cCB0aGUgaG9vayB1dGlsaXplcyB0aGUgbmF0aXZlIG9iamVjdCBsaXRlcmFsIGhhc2guXHJcblx0ICovXHJcblx0dmFyIFNUT1JBR0UgPSB7XHJcblx0XHRhY3Rpb25zOiB7fSxcclxuXHRcdGZpbHRlcnM6IHt9XHJcblx0fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGhvb2sgYnkgcmVzZXR0aW5nIHRoZSB2YWx1ZSBvZiBpdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB0eXBlIFR5cGUgb2YgaG9vaywgZWl0aGVyICdhY3Rpb25zJyBvciAnZmlsdGVycydcclxuXHQgKiBAcGFyYW0gaG9vayBUaGUgaG9vayAobmFtZXNwYWNlLmlkZW50aWZpZXIpIHRvIHJlbW92ZVxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBfcmVtb3ZlSG9vayggdHlwZSwgaG9vaywgY2FsbGJhY2ssIGNvbnRleHQgKSB7XHJcblx0XHR2YXIgaGFuZGxlcnMsIGhhbmRsZXIsIGk7XHJcblxyXG5cdFx0aWYgKCAhIFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdICkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRpZiAoICEgY2FsbGJhY2sgKSB7XHJcblx0XHRcdFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdID0gW107XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRoYW5kbGVycyA9IFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdO1xyXG5cdFx0XHRpZiAoICEgY29udGV4dCApIHtcclxuXHRcdFx0XHRmb3IgKCBpID0gaGFuZGxlcnMubGVuZ3RoOyBpLS07ICkge1xyXG5cdFx0XHRcdFx0aWYgKCBoYW5kbGVyc1sgaSBdLmNhbGxiYWNrID09PSBjYWxsYmFjayApIHtcclxuXHRcdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKCBpLCAxICk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGZvciAoIGkgPSBoYW5kbGVycy5sZW5ndGg7IGktLTsgKSB7XHJcblx0XHRcdFx0XHRoYW5kbGVyID0gaGFuZGxlcnNbIGkgXTtcclxuXHRcdFx0XHRcdGlmICggaGFuZGxlci5jYWxsYmFjayA9PT0gY2FsbGJhY2sgJiYgaGFuZGxlci5jb250ZXh0ID09PSBjb250ZXh0ICkge1xyXG5cdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoIGksIDEgKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZSBhbiBpbnNlcnQgc29ydCBmb3Iga2VlcGluZyBvdXIgaG9va3Mgb3JnYW5pemVkIGJhc2VkIG9uIHByaW9yaXR5LiBUaGlzIGZ1bmN0aW9uIGlzIHJpZGljdWxvdXNseSBmYXN0ZXJcclxuXHQgKiB0aGFuIGJ1YmJsZSBzb3J0LCBldGM6IGh0dHA6Ly9qc3BlcmYuY29tL2phdmFzY3JpcHQtc29ydFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGhvb2tzIFRoZSBjdXN0b20gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGFwcHJvcHJpYXRlIGhvb2tzIHRvIHBlcmZvcm0gYW4gaW5zZXJ0IHNvcnQgb24uXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBfaG9va0luc2VydFNvcnQoIGhvb2tzICkge1xyXG5cdFx0dmFyIHRtcEhvb2ssIGosIHByZXZIb29rO1xyXG5cdFx0Zm9yICggdmFyIGkgPSAxLCBsZW4gPSBob29rcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcclxuXHRcdFx0dG1wSG9vayA9IGhvb2tzWyBpIF07XHJcblx0XHRcdGogPSBpO1xyXG5cdFx0XHR3aGlsZSAoICggcHJldkhvb2sgPSBob29rc1sgaiAtIDEgXSApICYmIHByZXZIb29rLnByaW9yaXR5ID4gdG1wSG9vay5wcmlvcml0eSApIHtcclxuXHRcdFx0XHRob29rc1sgaiBdID0gaG9va3NbIGogLSAxIF07XHJcblx0XHRcdFx0LS1qO1xyXG5cdFx0XHR9XHJcblx0XHRcdGhvb2tzWyBqIF0gPSB0bXBIb29rO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBob29rcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdGhlIGhvb2sgdG8gdGhlIGFwcHJvcHJpYXRlIHN0b3JhZ2UgY29udGFpbmVyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdHlwZSAnYWN0aW9ucycgb3IgJ2ZpbHRlcnMnXHJcblx0ICogQHBhcmFtIGhvb2sgVGhlIGhvb2sgKG5hbWVzcGFjZS5pZGVudGlmaWVyKSB0byBhZGQgdG8gb3VyIGV2ZW50IG1hbmFnZXJcclxuXHQgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgaG9vayBpcyBleGVjdXRlZC5cclxuXHQgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHByaW9yaXR5IG9mIHRoaXMgaG9vay4gTXVzdCBiZSBhbiBpbnRlZ2VyLlxyXG5cdCAqIEBwYXJhbSBbY29udGV4dF0gQSB2YWx1ZSB0byBiZSB1c2VkIGZvciB0aGlzXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBfYWRkSG9vayggdHlwZSwgaG9vaywgY2FsbGJhY2ssIHByaW9yaXR5LCBjb250ZXh0ICkge1xyXG5cdFx0dmFyIGhvb2tPYmplY3QgPSB7XHJcblx0XHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcclxuXHRcdFx0cHJpb3JpdHk6IHByaW9yaXR5LFxyXG5cdFx0XHRjb250ZXh0OiBjb250ZXh0XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIFV0aWxpemUgJ3Byb3AgaXRzZWxmJyA6IGh0dHA6Ly9qc3BlcmYuY29tL2hhc293bnByb3BlcnR5LXZzLWluLXZzLXVuZGVmaW5lZC8xOVxyXG5cdFx0dmFyIGhvb2tzID0gU1RPUkFHRVsgdHlwZSBdWyBob29rIF07XHJcblx0XHRpZiAoIGhvb2tzICkge1xyXG5cdFx0XHRob29rcy5wdXNoKCBob29rT2JqZWN0ICk7XHJcblx0XHRcdGhvb2tzID0gX2hvb2tJbnNlcnRTb3J0KCBob29rcyApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aG9va3MgPSBbIGhvb2tPYmplY3QgXTtcclxuXHRcdH1cclxuXHJcblx0XHRTVE9SQUdFWyB0eXBlIF1bIGhvb2sgXSA9IGhvb2tzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUnVucyB0aGUgc3BlY2lmaWVkIGhvb2suIElmIGl0IGlzIGFuIGFjdGlvbiwgdGhlIHZhbHVlIGlzIG5vdCBtb2RpZmllZCBidXQgaWYgaXQgaXMgYSBmaWx0ZXIsIGl0IGlzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHR5cGUgJ2FjdGlvbnMnIG9yICdmaWx0ZXJzJ1xyXG5cdCAqIEBwYXJhbSBob29rIFRoZSBob29rICggbmFtZXNwYWNlLmlkZW50aWZpZXIgKSB0byBiZSByYW4uXHJcblx0ICogQHBhcmFtIGFyZ3MgQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGFjdGlvbi9maWx0ZXIuIElmIGl0J3MgYSBmaWx0ZXIsIGFyZ3MgaXMgYWN0dWFsbHkgYSBzaW5nbGUgcGFyYW1ldGVyLlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gX3J1bkhvb2soIHR5cGUsIGhvb2ssIGFyZ3MgKSB7XHJcblx0XHR2YXIgaGFuZGxlcnMgPSBTVE9SQUdFWyB0eXBlIF1bIGhvb2sgXSwgaSwgbGVuO1xyXG5cclxuXHRcdGlmICggISBoYW5kbGVycyApIHtcclxuXHRcdFx0cmV0dXJuICggJ2ZpbHRlcnMnID09PSB0eXBlICkgPyBhcmdzWyAwIF0gOiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRsZW4gPSBoYW5kbGVycy5sZW5ndGg7XHJcblx0XHRpZiAoICdmaWx0ZXJzJyA9PT0gdHlwZSApIHtcclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcclxuXHRcdFx0XHRhcmdzWyAwIF0gPSBoYW5kbGVyc1sgaSBdLmNhbGxiYWNrLmFwcGx5KCBoYW5kbGVyc1sgaSBdLmNvbnRleHQsIGFyZ3MgKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcclxuXHRcdFx0XHRoYW5kbGVyc1sgaSBdLmNhbGxiYWNrLmFwcGx5KCBoYW5kbGVyc1sgaSBdLmNvbnRleHQsIGFyZ3MgKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAoICdmaWx0ZXJzJyA9PT0gdHlwZSApID8gYXJnc1sgMCBdIDogdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgYW4gYWN0aW9uIHRvIHRoZSBldmVudCBtYW5hZ2VyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGFjdGlvbiBNdXN0IGNvbnRhaW4gbmFtZXNwYWNlLmlkZW50aWZpZXJcclxuXHQgKiBAcGFyYW0gY2FsbGJhY2sgTXVzdCBiZSBhIHZhbGlkIGNhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSB0aGlzIGFjdGlvbiBpcyBhZGRlZFxyXG5cdCAqIEBwYXJhbSBbcHJpb3JpdHk9MTBdIFVzZWQgdG8gY29udHJvbCB3aGVuIHRoZSBmdW5jdGlvbiBpcyBleGVjdXRlZCBpbiByZWxhdGlvbiB0byBvdGhlciBjYWxsYmFja3MgYm91bmQgdG8gdGhlIHNhbWUgaG9va1xyXG5cdCAqIEBwYXJhbSBbY29udGV4dF0gU3VwcGx5IGEgdmFsdWUgdG8gYmUgdXNlZCBmb3IgdGhpc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGFkZEFjdGlvbiggYWN0aW9uLCBjYWxsYmFjaywgcHJpb3JpdHksIGNvbnRleHQgKSB7XHJcblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgYWN0aW9uICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBjYWxsYmFjayApIHtcclxuXHRcdFx0cHJpb3JpdHkgPSBwYXJzZUludCggKCBwcmlvcml0eSB8fCAxMCApLCAxMCApO1xyXG5cdFx0XHRfYWRkSG9vayggJ2FjdGlvbnMnLCBhY3Rpb24sIGNhbGxiYWNrLCBwcmlvcml0eSwgY29udGV4dCApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybXMgYW4gYWN0aW9uIGlmIGl0IGV4aXN0cy4gWW91IGNhbiBwYXNzIGFzIG1hbnkgYXJndW1lbnRzIGFzIHlvdSB3YW50IHRvIHRoaXMgZnVuY3Rpb247IHRoZSBvbmx5IHJ1bGUgaXNcclxuXHQgKiB0aGF0IHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGFsd2F5cyBiZSB0aGUgYWN0aW9uLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRvQWN0aW9uKCAvKiBhY3Rpb24sIGFyZzEsIGFyZzIsIC4uLiAqLyApIHtcclxuXHRcdHZhciBhcmdzID0gc2xpY2UuY2FsbCggYXJndW1lbnRzICk7XHJcblx0XHR2YXIgYWN0aW9uID0gYXJncy5zaGlmdCgpO1xyXG5cclxuXHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiBhY3Rpb24gKSB7XHJcblx0XHRcdF9ydW5Ib29rKCAnYWN0aW9ucycsIGFjdGlvbiwgYXJncyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGFjdGlvbiBpZiBpdCBjb250YWlucyBhIG5hbWVzcGFjZS5pZGVudGlmaWVyICYgZXhpc3RzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGFjdGlvbiBUaGUgYWN0aW9uIHRvIHJlbW92ZVxyXG5cdCAqIEBwYXJhbSBbY2FsbGJhY2tdIENhbGxiYWNrIGZ1bmN0aW9uIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJlbW92ZUFjdGlvbiggYWN0aW9uLCBjYWxsYmFjayApIHtcclxuXHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiBhY3Rpb24gKSB7XHJcblx0XHRcdF9yZW1vdmVIb29rKCAnYWN0aW9ucycsIGFjdGlvbiwgY2FsbGJhY2sgKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gTWV0aG9kc0F2YWlsYWJsZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgYSBmaWx0ZXIgdG8gdGhlIGV2ZW50IG1hbmFnZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZmlsdGVyIE11c3QgY29udGFpbiBuYW1lc3BhY2UuaWRlbnRpZmllclxyXG5cdCAqIEBwYXJhbSBjYWxsYmFjayBNdXN0IGJlIGEgdmFsaWQgY2FsbGJhY2sgZnVuY3Rpb24gYmVmb3JlIHRoaXMgYWN0aW9uIGlzIGFkZGVkXHJcblx0ICogQHBhcmFtIFtwcmlvcml0eT0xMF0gVXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGluIHJlbGF0aW9uIHRvIG90aGVyIGNhbGxiYWNrcyBib3VuZCB0byB0aGUgc2FtZSBob29rXHJcblx0ICogQHBhcmFtIFtjb250ZXh0XSBTdXBwbHkgYSB2YWx1ZSB0byBiZSB1c2VkIGZvciB0aGlzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYWRkRmlsdGVyKCBmaWx0ZXIsIGNhbGxiYWNrLCBwcmlvcml0eSwgY29udGV4dCApIHtcclxuXHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiBmaWx0ZXIgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGNhbGxiYWNrICkge1xyXG5cdFx0XHRwcmlvcml0eSA9IHBhcnNlSW50KCAoIHByaW9yaXR5IHx8IDEwICksIDEwICk7XHJcblx0XHRcdF9hZGRIb29rKCAnZmlsdGVycycsIGZpbHRlciwgY2FsbGJhY2ssIHByaW9yaXR5LCBjb250ZXh0ICk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIE1ldGhvZHNBdmFpbGFibGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtcyBhIGZpbHRlciBpZiBpdCBleGlzdHMuIFlvdSBzaG91bGQgb25seSBldmVyIHBhc3MgMSBhcmd1bWVudCB0byBiZSBmaWx0ZXJlZC4gVGhlIG9ubHkgcnVsZSBpcyB0aGF0XHJcblx0ICogdGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYWx3YXlzIGJlIHRoZSBmaWx0ZXIuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYXBwbHlGaWx0ZXJzKCAvKiBmaWx0ZXIsIGZpbHRlcmVkIGFyZywgYXJnMiwgLi4uICovICkge1xyXG5cdFx0dmFyIGFyZ3MgPSBzbGljZS5jYWxsKCBhcmd1bWVudHMgKTtcclxuXHRcdHZhciBmaWx0ZXIgPSBhcmdzLnNoaWZ0KCk7XHJcblxyXG5cdFx0aWYgKCAnc3RyaW5nJyA9PT0gdHlwZW9mIGZpbHRlciApIHtcclxuXHRcdFx0cmV0dXJuIF9ydW5Ib29rKCAnZmlsdGVycycsIGZpbHRlciwgYXJncyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGZpbHRlciBpZiBpdCBjb250YWlucyBhIG5hbWVzcGFjZS5pZGVudGlmaWVyICYgZXhpc3RzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZpbHRlciBUaGUgYWN0aW9uIHRvIHJlbW92ZVxyXG5cdCAqIEBwYXJhbSBbY2FsbGJhY2tdIENhbGxiYWNrIGZ1bmN0aW9uIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJlbW92ZUZpbHRlciggZmlsdGVyLCBjYWxsYmFjayApIHtcclxuXHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiBmaWx0ZXIgKSB7XHJcblx0XHRcdF9yZW1vdmVIb29rKCAnZmlsdGVycycsIGZpbHRlciwgY2FsbGJhY2sgKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gTWV0aG9kc0F2YWlsYWJsZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1haW50YWluIGEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3Qgc2NvcGUgc28gb3VyIHB1YmxpYyBtZXRob2RzIG5ldmVyIGdldCBjb25mdXNpbmcuXHJcblx0ICovXHJcblx0TWV0aG9kc0F2YWlsYWJsZSA9IHtcclxuXHRcdHJlbW92ZUZpbHRlcjogcmVtb3ZlRmlsdGVyLFxyXG5cdFx0YXBwbHlGaWx0ZXJzOiBhcHBseUZpbHRlcnMsXHJcblx0XHRhZGRGaWx0ZXI6IGFkZEZpbHRlcixcclxuXHRcdHJlbW92ZUFjdGlvbjogcmVtb3ZlQWN0aW9uLFxyXG5cdFx0ZG9BY3Rpb246IGRvQWN0aW9uLFxyXG5cdFx0YWRkQWN0aW9uOiBhZGRBY3Rpb25cclxuXHR9O1xyXG5cclxuXHQvLyByZXR1cm4gYWxsIG9mIHRoZSBwdWJsaWNseSBhdmFpbGFibGUgbWV0aG9kc1xyXG5cdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFdmVudE1hbmFnZXI7XHJcbiIsInZhciBNb2R1bGUgPSBmdW5jdGlvbigpIHtcclxuXHR2YXIgJCA9IGpRdWVyeSxcclxuXHRcdGluc3RhbmNlUGFyYW1zID0gYXJndW1lbnRzLFxyXG5cdFx0c2VsZiA9IHRoaXMsXHJcblx0XHRzZXR0aW5ncyxcclxuXHRcdGVsZW1lbnRzLFxyXG5cdFx0ZXZlbnRzID0ge307XHJcblxyXG5cdHZhciBlbnN1cmVDbG9zdXJlTWV0aG9kcyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGNsb3N1cmVNZXRob2RzTmFtZXMgPSBzZWxmLmdldENsb3N1cmVNZXRob2RzTmFtZXMoKTtcclxuXHJcblx0XHQkLmVhY2goIGNsb3N1cmVNZXRob2RzTmFtZXMsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgb2xkTWV0aG9kID0gc2VsZlsgdGhpcyBdO1xyXG5cclxuXHRcdFx0c2VsZlsgdGhpcyBdID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0b2xkTWV0aG9kLmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTtcclxuXHRcdFx0fTtcclxuXHRcdH0pO1xyXG5cdH07XHJcblxyXG5cdHZhciBpbml0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuXHRcdHNldHRpbmdzID0gc2VsZi5nZXREZWZhdWx0U2V0dGluZ3MoKTtcclxuXHR9O1xyXG5cclxuXHR2YXIgaW5pdEVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRlbGVtZW50cyA9IHNlbGYuZ2V0RGVmYXVsdEVsZW1lbnRzKCk7XHJcblx0fTtcclxuXHJcblx0dmFyIGluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHNlbGYuX19jb25zdHJ1Y3QuYXBwbHkoIHNlbGYsIGluc3RhbmNlUGFyYW1zICk7XHJcblxyXG5cdFx0ZW5zdXJlQ2xvc3VyZU1ldGhvZHMoKTtcclxuXHJcblx0XHRpbml0U2V0dGluZ3MoKTtcclxuXHJcblx0XHRpbml0RWxlbWVudHMoKTtcclxuXHJcblx0XHRzZWxmLnRyaWdnZXIoICdpbml0JyApO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuZ2V0SXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGl0ZW1LZXkgKSB7XHJcblx0XHRpZiAoIGl0ZW1LZXkgKSB7XHJcblx0XHRcdHZhciBrZXlTdGFjayA9IGl0ZW1LZXkuc3BsaXQoICcuJyApLFxyXG5cdFx0XHRcdGN1cnJlbnRLZXkgPSBrZXlTdGFjay5zcGxpY2UoIDAsIDEgKTtcclxuXHJcblx0XHRcdGlmICggISBrZXlTdGFjay5sZW5ndGggKSB7XHJcblx0XHRcdFx0cmV0dXJuIGl0ZW1zWyBjdXJyZW50S2V5IF07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICggISBpdGVtc1sgY3VycmVudEtleSBdICkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0SXRlbXMoICBpdGVtc1sgY3VycmVudEtleSBdLCBrZXlTdGFjay5qb2luKCAnLicgKSApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBpdGVtcztcclxuXHR9O1xyXG5cclxuXHR0aGlzLmdldFNldHRpbmdzID0gZnVuY3Rpb24oIHNldHRpbmcgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggc2V0dGluZ3MsIHNldHRpbmcgKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLmdldEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1lbnQgKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRJdGVtcyggZWxlbWVudHMsIGVsZW1lbnQgKTtcclxuXHR9O1xyXG5cclxuXHR0aGlzLnNldFNldHRpbmdzID0gZnVuY3Rpb24oIHNldHRpbmdLZXksIHZhbHVlLCBzZXR0aW5nc0NvbnRhaW5lciApIHtcclxuXHRcdGlmICggISBzZXR0aW5nc0NvbnRhaW5lciApIHtcclxuXHRcdFx0c2V0dGluZ3NDb250YWluZXIgPSBzZXR0aW5ncztcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICdvYmplY3QnID09PSB0eXBlb2Ygc2V0dGluZ0tleSApIHtcclxuXHRcdFx0JC5leHRlbmQoIHNldHRpbmdzQ29udGFpbmVyLCBzZXR0aW5nS2V5ICk7XHJcblxyXG5cdFx0XHRyZXR1cm4gc2VsZjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIga2V5U3RhY2sgPSBzZXR0aW5nS2V5LnNwbGl0KCAnLicgKSxcclxuXHRcdFx0Y3VycmVudEtleSA9IGtleVN0YWNrLnNwbGljZSggMCwgMSApO1xyXG5cclxuXHRcdGlmICggISBrZXlTdGFjay5sZW5ndGggKSB7XHJcblx0XHRcdHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gPSB2YWx1ZTtcclxuXHJcblx0XHRcdHJldHVybiBzZWxmO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICggISBzZXR0aW5nc0NvbnRhaW5lclsgY3VycmVudEtleSBdICkge1xyXG5cdFx0XHRzZXR0aW5nc0NvbnRhaW5lclsgY3VycmVudEtleSBdID0ge307XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHNlbGYuc2V0U2V0dGluZ3MoIGtleVN0YWNrLmpvaW4oICcuJyApLCB2YWx1ZSwgc2V0dGluZ3NDb250YWluZXJbIGN1cnJlbnRLZXkgXSApO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuYWRkRWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtZW50TmFtZSwgJGVsZW1lbnQgKSB7XHJcblx0XHRlbGVtZW50c1sgZWxlbWVudE5hbWUgXSA9ICRlbGVtZW50O1xyXG5cdH07XHJcblxyXG5cdHRoaXMub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBjYWxsYmFjayApIHtcclxuXHRcdGlmICggISBldmVudHNbIGV2ZW50TmFtZSBdICkge1xyXG5cdFx0XHRldmVudHNbIGV2ZW50TmFtZSBdID0gW107XHJcblx0XHR9XHJcblxyXG5cdFx0ZXZlbnRzWyBldmVudE5hbWUgXS5wdXNoKCBjYWxsYmFjayApO1xyXG5cclxuXHRcdHJldHVybiBzZWxmO1xyXG5cdH07XHJcblxyXG5cdHRoaXMub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgY2FsbGJhY2sgKSB7XHJcblx0XHRpZiAoICEgZXZlbnRzWyBldmVudE5hbWUgXSApIHtcclxuXHRcdFx0cmV0dXJuIHNlbGY7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCAhIGNhbGxiYWNrICkge1xyXG5cdFx0XHRkZWxldGUgZXZlbnRzWyBldmVudE5hbWUgXTtcclxuXHJcblx0XHRcdHJldHVybiBzZWxmO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjYWxsYmFja0luZGV4ID0gZXZlbnRzWyBldmVudE5hbWUgXS5pbmRleE9mKCBjYWxsYmFjayApO1xyXG5cclxuXHRcdGlmICggLTEgIT09IGNhbGxiYWNrSW5kZXggKSB7XHJcblx0XHRcdGRlbGV0ZSBldmVudHNbIGV2ZW50TmFtZSBdWyBjYWxsYmFja0luZGV4IF07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHNlbGY7XHJcblx0fTtcclxuXHJcblx0dGhpcy50cmlnZ2VyID0gZnVuY3Rpb24oIGV2ZW50TmFtZSApIHtcclxuXHRcdHZhciBtZXRob2ROYW1lID0gJ29uJyArIGV2ZW50TmFtZVsgMCBdLnRvVXBwZXJDYXNlKCkgKyBldmVudE5hbWUuc2xpY2UoIDEgKSxcclxuXHRcdFx0cGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xyXG5cclxuXHRcdGlmICggc2VsZlsgbWV0aG9kTmFtZSBdICkge1xyXG5cdFx0XHRzZWxmWyBtZXRob2ROYW1lIF0uYXBwbHkoIHNlbGYsIHBhcmFtcyApO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjYWxsYmFja3MgPSBldmVudHNbIGV2ZW50TmFtZSBdO1xyXG5cclxuXHRcdGlmICggISBjYWxsYmFja3MgKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQkLmVhY2goIGNhbGxiYWNrcywgZnVuY3Rpb24oIGluZGV4LCBjYWxsYmFjayApIHtcclxuXHRcdFx0Y2FsbGJhY2suYXBwbHkoIHNlbGYsIHBhcmFtcyApO1xyXG5cdFx0fSApO1xyXG5cdH07XHJcblxyXG5cdGluaXQoKTtcclxufTtcclxuXHJcbk1vZHVsZS5wcm90b3R5cGUuX19jb25zdHJ1Y3QgPSBmdW5jdGlvbigpIHt9O1xyXG5cclxuTW9kdWxlLnByb3RvdHlwZS5nZXREZWZhdWx0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4ge307XHJcbn07XHJcblxyXG5Nb2R1bGUucHJvdG90eXBlLmdldERlZmF1bHRFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB7fTtcclxufTtcclxuXHJcbk1vZHVsZS5wcm90b3R5cGUuZ2V0Q2xvc3VyZU1ldGhvZHNOYW1lcyA9IGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiBbXTtcclxufTtcclxuXHJcbk1vZHVsZS5leHRlbmQgPSBmdW5jdGlvbiggcHJvcGVydGllcyApIHtcclxuXHR2YXIgJCA9IGpRdWVyeSxcclxuXHRcdHBhcmVudCA9IHRoaXM7XHJcblxyXG5cdHZhciBjaGlsZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHBhcmVudC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcblx0fTtcclxuXHJcblx0JC5leHRlbmQoIGNoaWxkLCBwYXJlbnQgKTtcclxuXHJcblx0Y2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggJC5leHRlbmQoIHt9LCBwYXJlbnQucHJvdG90eXBlLCBwcm9wZXJ0aWVzICkgKTtcclxuXHJcblx0Y2hpbGQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY2hpbGQ7XHJcblxyXG5cdGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7XHJcblxyXG5cdHJldHVybiBjaGlsZDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kdWxlO1xyXG4iXX0=
