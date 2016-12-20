(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"../utils/hooks":16,"elementor-frontend/elements-handler":1,"elementor-frontend/handlers/accordion":3,"elementor-frontend/handlers/alert":4,"elementor-frontend/handlers/counter":5,"elementor-frontend/handlers/global":6,"elementor-frontend/handlers/image-carousel":7,"elementor-frontend/handlers/menu-anchor":8,"elementor-frontend/handlers/progress":9,"elementor-frontend/handlers/section":10,"elementor-frontend/handlers/tabs":11,"elementor-frontend/handlers/toggle":12,"elementor-frontend/handlers/video":13,"elementor-frontend/handlers/widget":14,"elementor-frontend/utils":15}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	$scope.find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
		$scope.removeClass( 'elementor-invisible' ).addClass( animation );
	}, { offset: '90%' } );
};

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

		$scrollable.animate( {
			scrollTop: $anchor.offset().top - adminBarHeight
		}, 1000 );
	} );
};

},{}],9:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	elementorFrontend.utils.waypoint( $scope.find( '.elementor-progress-bar' ), function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	}, { offset: '90%' } );
};

},{}],10:[function(require,module,exports){
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
			resetCss = {
				width: 'auto'
			};

		resetCss[ direction ] = 0;

		$section.css( resetCss );

		if ( ! $section.hasClass( 'elementor-section-stretched' ) ) {
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
		elementorFrontend.elementsHandler.addExternalListener( $section, 'resize', stretchSection );
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
var Utils;

Utils = function( $ ) {
	var self = this;

	this.onYoutubeApiReady = function( callback ) {
		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				self.onYoutubeApiReady( callback );
			}, 350 );
		}
	};

	this.insertYTApi = function() {
		$( 'script:first' ).before(  $( '<script>', { src: 'https://www.youtube.com/iframe_api' } ) );
	};

	this.waypoint = function( $element, callback, options ) {
		var correctCallback = function() {
			var element = this.element || this;

			return callback.apply( element, arguments );
		};

		$element.waypoint( correctCallback, options );
	};
};

module.exports = Utils;

},{}],16:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=frontend.js.map
