(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
( function( $ ) {
	var ElementsHandler = require( 'elementor-frontend/elements-handler' ),
	    Utils = require( 'elementor-frontend/utils' );

	var ElementorFrontend = function() {
		var self = this;

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

		var addGlobalHandlers = function() {
			self.elementsHandler.addGlobalHandler( require( 'elementor-frontend/handlers/global' ) );
		};

		var addElementsHandlers = function() {
			$.each( elementsDefaultHandlers, function( elementName ) {
				self.elementsHandler.addHandler( elementName, this );
			} );
		};

		var runElementsHandlers = function() {
			$( '.elementor-element' ).each( function() {
				self.elementsHandler.runReadyTrigger( $( this ) );
			} );
		};

		this.elementsHandler = new ElementsHandler( $ );
		this.utils = new Utils( $ );

		this.init = function() {
			addGlobalHandlers();
			addElementsHandlers();

			self.utils.insertYTApi();

			runElementsHandlers();
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

jQuery( elementorFrontend.init );

},{"elementor-frontend/elements-handler":1,"elementor-frontend/handlers/accordion":3,"elementor-frontend/handlers/alert":4,"elementor-frontend/handlers/counter":5,"elementor-frontend/handlers/global":6,"elementor-frontend/handlers/image-carousel":7,"elementor-frontend/handlers/menu-anchor":8,"elementor-frontend/handlers/progress":9,"elementor-frontend/handlers/section":10,"elementor-frontend/handlers/tabs":11,"elementor-frontend/handlers/toggle":12,"elementor-frontend/handlers/video":13,"elementor-frontend/utils":14}],3:[function(require,module,exports){
module.exports = function( $ ) {
	var $this = $( this ),
		defaultActiveSection = $this.find( '.elementor-accordion' ).data( 'active-section' ),
		$accordionTitles = $this.find( '.elementor-accordion-title' ),
		$activeTitle = $accordionTitles.filter( '.active' );

	var activateSection = function( sectionIndex ) {
		var $requestedTitle = $accordionTitles.filter( '[data-section="' + sectionIndex + '"]' ),
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

			$activeTitle = $requestedTitle;
		}
	};

	if ( ! defaultActiveSection ) {
		defaultActiveSection = 1;
	}

	activateSection( defaultActiveSection );

	$accordionTitles.on( 'click', function() {
		activateSection( this.dataset.section );
	} );
};

},{}],4:[function(require,module,exports){
module.exports = function( $ ) {
	$( this ).find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};

},{}],5:[function(require,module,exports){
module.exports = function( $ ) {
	this.find( '.elementor-counter-number' ).waypoint( function() {
		var $number = $( this );

		$number.numerator( {
			duration: $number.data( 'duration' )
		} );
	}, { offset: '90%' } );
};

},{}],6:[function(require,module,exports){
module.exports = function() {
	if ( elementorFrontend.elementsHandler.isEditorMode() ) {
		return;
	}

	var $element = this,
		animation = $element.data( 'animation' );

	if ( ! animation ) {
		return;
	}

	$element.addClass( 'elementor-invisible' ).removeClass( animation );

	$element.waypoint( function() {
		$element.removeClass( 'elementor-invisible' ).addClass( animation );
	}, { offset: '90%' } );

};

},{}],7:[function(require,module,exports){
module.exports = function( $ ) {
	var $carousel = $( this ).find( '.elementor-image-carousel' );
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
module.exports = function( $ ) {
	if ( elementorFrontend.elementsHandler.isEditorMode() ) {
		return;
	}

	var $anchor = this.find( '.elementor-menu-anchor' ),
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
module.exports = function( $ ) {
	var interval = 80;

	$( this ).find( '.elementor-progress-bar' ).waypoint( function() {
		var $progressbar = $( this ),
			max = parseInt( $progressbar.data( 'max' ), 10 ),
			$inner = $progressbar.next(),
			$innerTextWrap = $inner.find( '.elementor-progress-text' ),
			$percent = $inner.find( '.elementor-progress-percentage' ),
			innerText = $inner.data( 'inner' ) ? $inner.data( 'inner' ) : '';

		$progressbar.css( 'width', max + '%' );
		$inner.css( 'width', max + '%' );
		$innerTextWrap.html( innerText + '' );
		$percent.html(  max + '%' );

	}, { offset: '90%' } );
};

},{}],10:[function(require,module,exports){
module.exports = function( $, scopeWindow ) {
	var player,
		ui = {
			backgroundVideoContainer: this.find( '.elementor-background-video-container' )
		},
		isYTVideo = false;

	if ( ! ui.backgroundVideoContainer.length ) {
		return;
	}

	ui.backgroundVideo = ui.backgroundVideoContainer.children( '.elementor-background-video' );

	var calcVideosSize = function() {
		var containerWidth = ui.backgroundVideoContainer.outerWidth(),
			containerHeight = ui.backgroundVideoContainer.outerHeight(),
			aspectRatioSetting = '16:9', //TEMP
			aspectRatioArray = aspectRatioSetting.split( ':' ),
			aspectRatio = aspectRatioArray[0] / aspectRatioArray[1],
			ratioWidth = containerWidth / aspectRatio,
			ratioHeight = containerHeight * aspectRatio,
			isWidthFixed = containerWidth / containerHeight > aspectRatio;

		return {
			width: isWidthFixed ? containerWidth : ratioHeight,
			height: isWidthFixed ? ratioWidth : containerHeight
		};
	};

	var changeVideoSize = function() {
		var $video = isYTVideo ? $( player.getIframe() ) : ui.backgroundVideo,
			size = calcVideosSize();

		$video.width( size.width ).height( size.height );
	};

	var prepareYTVideo = function( YT, videoID ) {

		player = new YT.Player( ui.backgroundVideo[0], {
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

	};

	var videoID = ui.backgroundVideo.data( 'video-id' );

	if ( videoID ) {
		isYTVideo = true;

		elementorFrontend.utils.onYoutubeApiReady( function( YT ) {
			setTimeout( function() {
				prepareYTVideo( YT, videoID );
			}, 1 );
		} );
	} else {
		ui.backgroundVideo.one( 'canplay', changeVideoSize );
	}

	$( scopeWindow ).on( 'resize', changeVideoSize );
};

},{}],11:[function(require,module,exports){
module.exports = function( $ ) {
	var $this = $( this ),
		defaultActiveTab = $this.find( '.elementor-tabs' ).data( 'active-tab' ),
		$tabsTitles = $this.find( '.elementor-tab-title' ),
		$tabs = $this.find( '.elementor-tab-content' ),
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
module.exports = function( $ ) {
	var $toggleTitles = $( this ).find( '.elementor-toggle-title' );

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
module.exports = function( $ ) {
	var $this = $( this ),
		$imageOverlay = $this.find( '.elementor-custom-embed-image-overlay' ),
		$videoFrame = $this.find( 'iframe' );

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
};

module.exports = Utils;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2VsZW1lbnRzLWhhbmRsZXIuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2Zyb250ZW5kLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9hY2NvcmRpb24uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2FsZXJ0LmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9jb3VudGVyLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9nbG9iYWwuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2ltYWdlLWNhcm91c2VsLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9tZW51LWFuY2hvci5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvcHJvZ3Jlc3MuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3NlY3Rpb24uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3RhYnMuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3RvZ2dsZS5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdmlkZW8uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEVsZW1lbnRzSGFuZGxlcjtcblxuRWxlbWVudHNIYW5kbGVyID0gZnVuY3Rpb24oICQgKSB7XG5cdHZhciByZWdpc3RlcmVkSGFuZGxlcnMgPSB7fSxcblx0XHRyZWdpc3RlcmVkR2xvYmFsSGFuZGxlcnMgPSBbXSxcblx0XHRmbGFnRWRpdG9yTW9kZSA9IGZhbHNlLFxuXHRcdHNjb3BlV2luZG93ID0gd2luZG93O1xuXG5cdHZhciBydW5HbG9iYWxIYW5kbGVycyA9IGZ1bmN0aW9uKCAkc2NvcGUgKSB7XG5cdFx0JC5lYWNoKCByZWdpc3RlcmVkR2xvYmFsSGFuZGxlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWxsKCAkc2NvcGUsICQsIHNjb3BlV2luZG93ICk7XG5cdFx0fSApO1xuXHR9O1xuXG5cdHRoaXMuc2V0RWRpdG9yTW9kZSA9IGZ1bmN0aW9uKCBtb2RlICkge1xuXHRcdGZsYWdFZGl0b3JNb2RlID0gbW9kZTtcblx0fTtcblxuXHR0aGlzLnNldFNjb3BlV2luZG93ID0gZnVuY3Rpb24oIHdpbmRvdyApIHtcblx0XHRzY29wZVdpbmRvdyA9IHdpbmRvdztcblx0fTtcblxuXHR0aGlzLmlzRWRpdG9yTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBmbGFnRWRpdG9yTW9kZTtcblx0fTtcblxuXHR0aGlzLmFkZEhhbmRsZXIgPSBmdW5jdGlvbiggd2lkZ2V0VHlwZSwgY2FsbGJhY2sgKSB7XG5cdFx0cmVnaXN0ZXJlZEhhbmRsZXJzWyB3aWRnZXRUeXBlIF0gPSBjYWxsYmFjaztcblx0fTtcblxuXHR0aGlzLmFkZEdsb2JhbEhhbmRsZXIgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG5cdFx0cmVnaXN0ZXJlZEdsb2JhbEhhbmRsZXJzLnB1c2goIGNhbGxiYWNrICk7XG5cdH07XG5cblx0dGhpcy5ydW5SZWFkeVRyaWdnZXIgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRcdHZhciBlbGVtZW50VHlwZSA9ICRzY29wZS5kYXRhKCAnZWxlbWVudF90eXBlJyApO1xuXG5cdFx0aWYgKCAhIGVsZW1lbnRUeXBlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHJ1bkdsb2JhbEhhbmRsZXJzKCAkc2NvcGUgKTtcblxuXHRcdGlmICggISByZWdpc3RlcmVkSGFuZGxlcnNbIGVsZW1lbnRUeXBlIF0gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmVnaXN0ZXJlZEhhbmRsZXJzWyBlbGVtZW50VHlwZSBdLmNhbGwoICRzY29wZSwgJCwgc2NvcGVXaW5kb3cgKTtcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudHNIYW5kbGVyO1xuIiwiKCBmdW5jdGlvbiggJCApIHtcblx0dmFyIEVsZW1lbnRzSGFuZGxlciA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvZWxlbWVudHMtaGFuZGxlcicgKSxcblx0ICAgIFV0aWxzID0gcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC91dGlscycgKTtcblxuXHR2YXIgRWxlbWVudG9yRnJvbnRlbmQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR2YXIgZWxlbWVudHNEZWZhdWx0SGFuZGxlcnMgPSB7XG5cdFx0XHRhY2NvcmRpb246IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvYWNjb3JkaW9uJyApLFxuXHRcdFx0YWxlcnQ6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvYWxlcnQnICksXG5cdFx0XHRjb3VudGVyOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2NvdW50ZXInICksXG5cdFx0XHQnaW1hZ2UtY2Fyb3VzZWwnOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2ltYWdlLWNhcm91c2VsJyApLFxuXHRcdFx0J21lbnUtYW5jaG9yJzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9tZW51LWFuY2hvcicgKSxcblx0XHRcdHByb2dyZXNzOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL3Byb2dyZXNzJyApLFxuXHRcdFx0c2VjdGlvbjogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9zZWN0aW9uJyApLFxuXHRcdFx0dGFiczogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy90YWJzJyApLFxuXHRcdFx0dG9nZ2xlOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL3RvZ2dsZScgKSxcblx0XHRcdHZpZGVvOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL3ZpZGVvJyApXG5cdFx0fTtcblxuXHRcdHZhciBhZGRHbG9iYWxIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi5lbGVtZW50c0hhbmRsZXIuYWRkR2xvYmFsSGFuZGxlciggcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9nbG9iYWwnICkgKTtcblx0XHR9O1xuXG5cdFx0dmFyIGFkZEVsZW1lbnRzSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcblx0XHRcdCQuZWFjaCggZWxlbWVudHNEZWZhdWx0SGFuZGxlcnMsIGZ1bmN0aW9uKCBlbGVtZW50TmFtZSApIHtcblx0XHRcdFx0c2VsZi5lbGVtZW50c0hhbmRsZXIuYWRkSGFuZGxlciggZWxlbWVudE5hbWUsIHRoaXMgKTtcblx0XHRcdH0gKTtcblx0XHR9O1xuXG5cdFx0dmFyIHJ1bkVsZW1lbnRzSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcblx0XHRcdCQoICcuZWxlbWVudG9yLWVsZW1lbnQnICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNlbGYuZWxlbWVudHNIYW5kbGVyLnJ1blJlYWR5VHJpZ2dlciggJCggdGhpcyApICk7XG5cdFx0XHR9ICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZWxlbWVudHNIYW5kbGVyID0gbmV3IEVsZW1lbnRzSGFuZGxlciggJCApO1xuXHRcdHRoaXMudXRpbHMgPSBuZXcgVXRpbHMoICQgKTtcblxuXHRcdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0YWRkR2xvYmFsSGFuZGxlcnMoKTtcblx0XHRcdGFkZEVsZW1lbnRzSGFuZGxlcnMoKTtcblxuXHRcdFx0c2VsZi51dGlscy5pbnNlcnRZVEFwaSgpO1xuXG5cdFx0XHRydW5FbGVtZW50c0hhbmRsZXJzKCk7XG5cdFx0fTtcblx0fTtcblxuXHR3aW5kb3cuZWxlbWVudG9yRnJvbnRlbmQgPSBuZXcgRWxlbWVudG9yRnJvbnRlbmQoKTtcbn0gKSggalF1ZXJ5ICk7XG5cbmpRdWVyeSggZWxlbWVudG9yRnJvbnRlbmQuaW5pdCApO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdGRlZmF1bHRBY3RpdmVTZWN0aW9uID0gJHRoaXMuZmluZCggJy5lbGVtZW50b3ItYWNjb3JkaW9uJyApLmRhdGEoICdhY3RpdmUtc2VjdGlvbicgKSxcblx0XHQkYWNjb3JkaW9uVGl0bGVzID0gJHRoaXMuZmluZCggJy5lbGVtZW50b3ItYWNjb3JkaW9uLXRpdGxlJyApLFxuXHRcdCRhY3RpdmVUaXRsZSA9ICRhY2NvcmRpb25UaXRsZXMuZmlsdGVyKCAnLmFjdGl2ZScgKTtcblxuXHR2YXIgYWN0aXZhdGVTZWN0aW9uID0gZnVuY3Rpb24oIHNlY3Rpb25JbmRleCApIHtcblx0XHR2YXIgJHJlcXVlc3RlZFRpdGxlID0gJGFjY29yZGlvblRpdGxlcy5maWx0ZXIoICdbZGF0YS1zZWN0aW9uPVwiJyArIHNlY3Rpb25JbmRleCArICdcIl0nICksXG5cdFx0XHRpc1JlcXVlc3RlZEFjdGl2ZSA9ICRyZXF1ZXN0ZWRUaXRsZS5oYXNDbGFzcyggJ2FjdGl2ZScgKTtcblxuXHRcdCRhY3RpdmVUaXRsZVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApXG5cdFx0XHQubmV4dCgpXG5cdFx0XHQuc2xpZGVVcCgpO1xuXG5cdFx0aWYgKCAhIGlzUmVxdWVzdGVkQWN0aXZlICkge1xuXHRcdFx0JHJlcXVlc3RlZFRpdGxlXG5cdFx0XHRcdC5hZGRDbGFzcyggJ2FjdGl2ZScgKVxuXHRcdFx0XHQubmV4dCgpXG5cdFx0XHRcdC5zbGlkZURvd24oKTtcblxuXHRcdFx0JGFjdGl2ZVRpdGxlID0gJHJlcXVlc3RlZFRpdGxlO1xuXHRcdH1cblx0fTtcblxuXHRpZiAoICEgZGVmYXVsdEFjdGl2ZVNlY3Rpb24gKSB7XG5cdFx0ZGVmYXVsdEFjdGl2ZVNlY3Rpb24gPSAxO1xuXHR9XG5cblx0YWN0aXZhdGVTZWN0aW9uKCBkZWZhdWx0QWN0aXZlU2VjdGlvbiApO1xuXG5cdCRhY2NvcmRpb25UaXRsZXMub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdGFjdGl2YXRlU2VjdGlvbiggdGhpcy5kYXRhc2V0LnNlY3Rpb24gKTtcblx0fSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdCQoIHRoaXMgKS5maW5kKCAnLmVsZW1lbnRvci1hbGVydC1kaXNtaXNzJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHQkKCB0aGlzICkucGFyZW50KCkuZmFkZU91dCgpO1xuXHR9ICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0dGhpcy5maW5kKCAnLmVsZW1lbnRvci1jb3VudGVyLW51bWJlcicgKS53YXlwb2ludCggZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRudW1iZXIgPSAkKCB0aGlzICk7XG5cblx0XHQkbnVtYmVyLm51bWVyYXRvcigge1xuXHRcdFx0ZHVyYXRpb246ICRudW1iZXIuZGF0YSggJ2R1cmF0aW9uJyApXG5cdFx0fSApO1xuXHR9LCB7IG9mZnNldDogJzkwJScgfSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cdGlmICggZWxlbWVudG9yRnJvbnRlbmQuZWxlbWVudHNIYW5kbGVyLmlzRWRpdG9yTW9kZSgpICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciAkZWxlbWVudCA9IHRoaXMsXG5cdFx0YW5pbWF0aW9uID0gJGVsZW1lbnQuZGF0YSggJ2FuaW1hdGlvbicgKTtcblxuXHRpZiAoICEgYW5pbWF0aW9uICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdCRlbGVtZW50LmFkZENsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZScgKS5yZW1vdmVDbGFzcyggYW5pbWF0aW9uICk7XG5cblx0JGVsZW1lbnQud2F5cG9pbnQoIGZ1bmN0aW9uKCkge1xuXHRcdCRlbGVtZW50LnJlbW92ZUNsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZScgKS5hZGRDbGFzcyggYW5pbWF0aW9uICk7XG5cdH0sIHsgb2Zmc2V0OiAnOTAlJyB9ICk7XG5cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgJGNhcm91c2VsID0gJCggdGhpcyApLmZpbmQoICcuZWxlbWVudG9yLWltYWdlLWNhcm91c2VsJyApO1xuXHRpZiAoICEgJGNhcm91c2VsLmxlbmd0aCApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgc2F2ZWRPcHRpb25zID0gJGNhcm91c2VsLmRhdGEoICdzbGlkZXJfb3B0aW9ucycgKSxcblx0XHR0YWJsZXRTbGlkZXMgPSAxID09PSBzYXZlZE9wdGlvbnMuc2xpZGVzVG9TaG93ID8gMSA6IDIsXG5cdFx0ZGVmYXVsdE9wdGlvbnMgPSB7XG5cdFx0XHRyZXNwb25zaXZlOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVha3BvaW50OiA3NjcsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2hvdzogdGFibGV0U2xpZGVzLFxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IHRhYmxldFNsaWRlc1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyZWFrcG9pbnQ6IDQ4MCxcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAxLFxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9LFxuXG5cdFx0c2xpY2tPcHRpb25zID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0T3B0aW9ucywgJGNhcm91c2VsLmRhdGEoICdzbGlkZXJfb3B0aW9ucycgKSApO1xuXG5cdCRjYXJvdXNlbC5zbGljayggc2xpY2tPcHRpb25zICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0aWYgKCBlbGVtZW50b3JGcm9udGVuZC5lbGVtZW50c0hhbmRsZXIuaXNFZGl0b3JNb2RlKCkgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyICRhbmNob3IgPSB0aGlzLmZpbmQoICcuZWxlbWVudG9yLW1lbnUtYW5jaG9yJyApLFxuXHRcdGFuY2hvcklEID0gJGFuY2hvci5hdHRyKCAnaWQnICksXG5cdFx0JGFuY2hvckxpbmtzID0gJCggJ2FbaHJlZio9XCIjJyArIGFuY2hvcklEICsgJ1wiXScgKSxcblx0XHQkc2Nyb2xsYWJsZSA9ICQoICdodG1sLCBib2R5JyApLFxuXHRcdGFkbWluQmFySGVpZ2h0ID0gJCggJyN3cGFkbWluYmFyJyApLmhlaWdodCgpO1xuXG5cdCRhbmNob3JMaW5rcy5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBpc1NhbWVQYXRobmFtZSA9ICggbG9jYXRpb24ucGF0aG5hbWUgPT09IHRoaXMucGF0aG5hbWUgKSxcblx0XHRcdGlzU2FtZUhvc3RuYW1lID0gKCBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gdGhpcy5ob3N0bmFtZSApO1xuXG5cdFx0aWYgKCAhIGlzU2FtZUhvc3RuYW1lIHx8ICEgaXNTYW1lUGF0aG5hbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdCRzY3JvbGxhYmxlLmFuaW1hdGUoIHtcblx0XHRcdHNjcm9sbFRvcDogJGFuY2hvci5vZmZzZXQoKS50b3AgLSBhZG1pbkJhckhlaWdodFxuXHRcdH0sIDEwMDAgKTtcblx0fSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdHZhciBpbnRlcnZhbCA9IDgwO1xuXG5cdCQoIHRoaXMgKS5maW5kKCAnLmVsZW1lbnRvci1wcm9ncmVzcy1iYXInICkud2F5cG9pbnQoIGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkcHJvZ3Jlc3NiYXIgPSAkKCB0aGlzICksXG5cdFx0XHRtYXggPSBwYXJzZUludCggJHByb2dyZXNzYmFyLmRhdGEoICdtYXgnICksIDEwICksXG5cdFx0XHQkaW5uZXIgPSAkcHJvZ3Jlc3NiYXIubmV4dCgpLFxuXHRcdFx0JGlubmVyVGV4dFdyYXAgPSAkaW5uZXIuZmluZCggJy5lbGVtZW50b3ItcHJvZ3Jlc3MtdGV4dCcgKSxcblx0XHRcdCRwZXJjZW50ID0gJGlubmVyLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLXBlcmNlbnRhZ2UnICksXG5cdFx0XHRpbm5lclRleHQgPSAkaW5uZXIuZGF0YSggJ2lubmVyJyApID8gJGlubmVyLmRhdGEoICdpbm5lcicgKSA6ICcnO1xuXG5cdFx0JHByb2dyZXNzYmFyLmNzcyggJ3dpZHRoJywgbWF4ICsgJyUnICk7XG5cdFx0JGlubmVyLmNzcyggJ3dpZHRoJywgbWF4ICsgJyUnICk7XG5cdFx0JGlubmVyVGV4dFdyYXAuaHRtbCggaW5uZXJUZXh0ICsgJycgKTtcblx0XHQkcGVyY2VudC5odG1sKCAgbWF4ICsgJyUnICk7XG5cblx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkLCBzY29wZVdpbmRvdyApIHtcblx0dmFyIHBsYXllcixcblx0XHR1aSA9IHtcblx0XHRcdGJhY2tncm91bmRWaWRlb0NvbnRhaW5lcjogdGhpcy5maW5kKCAnLmVsZW1lbnRvci1iYWNrZ3JvdW5kLXZpZGVvLWNvbnRhaW5lcicgKVxuXHRcdH0sXG5cdFx0aXNZVFZpZGVvID0gZmFsc2U7XG5cblx0aWYgKCAhIHVpLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dWkuYmFja2dyb3VuZFZpZGVvID0gdWkuYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLmNoaWxkcmVuKCAnLmVsZW1lbnRvci1iYWNrZ3JvdW5kLXZpZGVvJyApO1xuXG5cdHZhciBjYWxjVmlkZW9zU2l6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250YWluZXJXaWR0aCA9IHVpLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5vdXRlcldpZHRoKCksXG5cdFx0XHRjb250YWluZXJIZWlnaHQgPSB1aS5iYWNrZ3JvdW5kVmlkZW9Db250YWluZXIub3V0ZXJIZWlnaHQoKSxcblx0XHRcdGFzcGVjdFJhdGlvU2V0dGluZyA9ICcxNjo5JywgLy9URU1QXG5cdFx0XHRhc3BlY3RSYXRpb0FycmF5ID0gYXNwZWN0UmF0aW9TZXR0aW5nLnNwbGl0KCAnOicgKSxcblx0XHRcdGFzcGVjdFJhdGlvID0gYXNwZWN0UmF0aW9BcnJheVswXSAvIGFzcGVjdFJhdGlvQXJyYXlbMV0sXG5cdFx0XHRyYXRpb1dpZHRoID0gY29udGFpbmVyV2lkdGggLyBhc3BlY3RSYXRpbyxcblx0XHRcdHJhdGlvSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICogYXNwZWN0UmF0aW8sXG5cdFx0XHRpc1dpZHRoRml4ZWQgPSBjb250YWluZXJXaWR0aCAvIGNvbnRhaW5lckhlaWdodCA+IGFzcGVjdFJhdGlvO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHdpZHRoOiBpc1dpZHRoRml4ZWQgPyBjb250YWluZXJXaWR0aCA6IHJhdGlvSGVpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBpc1dpZHRoRml4ZWQgPyByYXRpb1dpZHRoIDogY29udGFpbmVySGVpZ2h0XG5cdFx0fTtcblx0fTtcblxuXHR2YXIgY2hhbmdlVmlkZW9TaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyICR2aWRlbyA9IGlzWVRWaWRlbyA/ICQoIHBsYXllci5nZXRJZnJhbWUoKSApIDogdWkuYmFja2dyb3VuZFZpZGVvLFxuXHRcdFx0c2l6ZSA9IGNhbGNWaWRlb3NTaXplKCk7XG5cblx0XHQkdmlkZW8ud2lkdGgoIHNpemUud2lkdGggKS5oZWlnaHQoIHNpemUuaGVpZ2h0ICk7XG5cdH07XG5cblx0dmFyIHByZXBhcmVZVFZpZGVvID0gZnVuY3Rpb24oIFlULCB2aWRlb0lEICkge1xuXG5cdFx0cGxheWVyID0gbmV3IFlULlBsYXllciggdWkuYmFja2dyb3VuZFZpZGVvWzBdLCB7XG5cdFx0XHR2aWRlb0lkOiB2aWRlb0lELFxuXHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHBsYXllci5tdXRlKCk7XG5cblx0XHRcdFx0XHRjaGFuZ2VWaWRlb1NpemUoKTtcblxuXHRcdFx0XHRcdHBsYXllci5wbGF5VmlkZW8oKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0b25TdGF0ZUNoYW5nZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggZXZlbnQuZGF0YSA9PT0gWVQuUGxheWVyU3RhdGUuRU5ERUQgKSB7XG5cdFx0XHRcdFx0XHRwbGF5ZXIuc2Vla1RvKCAwICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cGxheWVyVmFyczoge1xuXHRcdFx0XHRjb250cm9sczogMCxcblx0XHRcdFx0c2hvd2luZm86IDBcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0fTtcblxuXHR2YXIgdmlkZW9JRCA9IHVpLmJhY2tncm91bmRWaWRlby5kYXRhKCAndmlkZW8taWQnICk7XG5cblx0aWYgKCB2aWRlb0lEICkge1xuXHRcdGlzWVRWaWRlbyA9IHRydWU7XG5cblx0XHRlbGVtZW50b3JGcm9udGVuZC51dGlscy5vbllvdXR1YmVBcGlSZWFkeSggZnVuY3Rpb24oIFlUICkge1xuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHByZXBhcmVZVFZpZGVvKCBZVCwgdmlkZW9JRCApO1xuXHRcdFx0fSwgMSApO1xuXHRcdH0gKTtcblx0fSBlbHNlIHtcblx0XHR1aS5iYWNrZ3JvdW5kVmlkZW8ub25lKCAnY2FucGxheScsIGNoYW5nZVZpZGVvU2l6ZSApO1xuXHR9XG5cblx0JCggc2NvcGVXaW5kb3cgKS5vbiggJ3Jlc2l6ZScsIGNoYW5nZVZpZGVvU2l6ZSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdHZhciAkdGhpcyA9ICQoIHRoaXMgKSxcblx0XHRkZWZhdWx0QWN0aXZlVGFiID0gJHRoaXMuZmluZCggJy5lbGVtZW50b3ItdGFicycgKS5kYXRhKCAnYWN0aXZlLXRhYicgKSxcblx0XHQkdGFic1RpdGxlcyA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLXRhYi10aXRsZScgKSxcblx0XHQkdGFicyA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLXRhYi1jb250ZW50JyApLFxuXHRcdCRhY3RpdmUsXG5cdFx0JGNvbnRlbnQ7XG5cblx0aWYgKCAhIGRlZmF1bHRBY3RpdmVUYWIgKSB7XG5cdFx0ZGVmYXVsdEFjdGl2ZVRhYiA9IDE7XG5cdH1cblxuXHR2YXIgYWN0aXZhdGVUYWIgPSBmdW5jdGlvbiggdGFiSW5kZXggKSB7XG5cdFx0aWYgKCAkYWN0aXZlICkge1xuXHRcdFx0JGFjdGl2ZS5yZW1vdmVDbGFzcyggJ2FjdGl2ZScgKTtcblxuXHRcdFx0JGNvbnRlbnQuaGlkZSgpO1xuXHRcdH1cblxuXHRcdCRhY3RpdmUgPSAkdGFic1RpdGxlcy5maWx0ZXIoICdbZGF0YS10YWI9XCInICsgdGFiSW5kZXggKyAnXCJdJyApO1xuXG5cdFx0JGFjdGl2ZS5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcblxuXHRcdCRjb250ZW50ID0gJHRhYnMuZmlsdGVyKCAnW2RhdGEtdGFiPVwiJyArIHRhYkluZGV4ICsgJ1wiXScgKTtcblxuXHRcdCRjb250ZW50LnNob3coKTtcblx0fTtcblxuXHRhY3RpdmF0ZVRhYiggZGVmYXVsdEFjdGl2ZVRhYiApO1xuXG5cdCR0YWJzVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRhY3RpdmF0ZVRhYiggdGhpcy5kYXRhc2V0LnRhYiApO1xuXHR9ICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0dmFyICR0b2dnbGVUaXRsZXMgPSAkKCB0aGlzICkuZmluZCggJy5lbGVtZW50b3ItdG9nZ2xlLXRpdGxlJyApO1xuXG5cdCR0b2dnbGVUaXRsZXMub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkYWN0aXZlID0gJCggdGhpcyApLFxuXHRcdFx0JGNvbnRlbnQgPSAkYWN0aXZlLm5leHQoKTtcblxuXHRcdGlmICggJGFjdGl2ZS5oYXNDbGFzcyggJ2FjdGl2ZScgKSApIHtcblx0XHRcdCRhY3RpdmUucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHQkY29udGVudC5zbGlkZVVwKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRhY3RpdmUuYWRkQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHQkY29udGVudC5zbGlkZURvd24oKTtcblx0XHR9XG5cdH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0JGltYWdlT3ZlcmxheSA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLWN1c3RvbS1lbWJlZC1pbWFnZS1vdmVybGF5JyApLFxuXHRcdCR2aWRlb0ZyYW1lID0gJHRoaXMuZmluZCggJ2lmcmFtZScgKTtcblxuXHRpZiAoICEgJGltYWdlT3ZlcmxheS5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0JGltYWdlT3ZlcmxheS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0JGltYWdlT3ZlcmxheS5yZW1vdmUoKTtcblx0XHR2YXIgbmV3U291cmNlVXJsID0gJHZpZGVvRnJhbWVbMF0uc3JjO1xuXHRcdC8vIFJlbW92ZSBvbGQgYXV0b3BsYXkgaWYgZXhpc3RzXG5cdFx0bmV3U291cmNlVXJsID0gbmV3U291cmNlVXJsLnJlcGxhY2UoICcmYXV0b3BsYXk9MCcsICcnICk7XG5cblx0XHQkdmlkZW9GcmFtZVswXS5zcmMgPSBuZXdTb3VyY2VVcmwgKyAnJmF1dG9wbGF5PTEnO1xuXHR9ICk7XG59O1xuIiwidmFyIFV0aWxzO1xuXG5VdGlscyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0dGhpcy5vbllvdXR1YmVBcGlSZWFkeSA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcblx0XHRpZiAoIHdpbmRvdy5ZVCAmJiBZVC5sb2FkZWQgKSB7XG5cdFx0XHRjYWxsYmFjayggWVQgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbm90IHJlYWR5IGNoZWNrIGFnYWluIGJ5IHRpbWVvdXQuLlxuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNlbGYub25Zb3V0dWJlQXBpUmVhZHkoIGNhbGxiYWNrICk7XG5cdFx0XHR9LCAzNTAgKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5pbnNlcnRZVEFwaSA9IGZ1bmN0aW9uKCkge1xuXHRcdCQoICdzY3JpcHQ6Zmlyc3QnICkuYmVmb3JlKCAgJCggJzxzY3JpcHQ+JywgeyBzcmM6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpJyB9ICkgKTtcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iXX0=
