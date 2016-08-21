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
	});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2VsZW1lbnRzLWhhbmRsZXIuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2Zyb250ZW5kLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9hY2NvcmRpb24uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2FsZXJ0LmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9jb3VudGVyLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9nbG9iYWwuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2ltYWdlLWNhcm91c2VsLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9tZW51LWFuY2hvci5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvcHJvZ3Jlc3MuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3NlY3Rpb24uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3RhYnMuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3RvZ2dsZS5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdmlkZW8uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBFbGVtZW50c0hhbmRsZXI7XG5cbkVsZW1lbnRzSGFuZGxlciA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgcmVnaXN0ZXJlZEhhbmRsZXJzID0ge30sXG5cdFx0cmVnaXN0ZXJlZEdsb2JhbEhhbmRsZXJzID0gW10sXG5cdFx0ZmxhZ0VkaXRvck1vZGUgPSBmYWxzZSxcblx0XHRzY29wZVdpbmRvdyA9IHdpbmRvdztcblxuXHR2YXIgcnVuR2xvYmFsSGFuZGxlcnMgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRcdCQuZWFjaCggcmVnaXN0ZXJlZEdsb2JhbEhhbmRsZXJzLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FsbCggJHNjb3BlLCAkLCBzY29wZVdpbmRvdyApO1xuXHRcdH0gKTtcblx0fTtcblxuXHR0aGlzLnNldEVkaXRvck1vZGUgPSBmdW5jdGlvbiggbW9kZSApIHtcblx0XHRmbGFnRWRpdG9yTW9kZSA9IG1vZGU7XG5cdH07XG5cblx0dGhpcy5zZXRTY29wZVdpbmRvdyA9IGZ1bmN0aW9uKCB3aW5kb3cgKSB7XG5cdFx0c2NvcGVXaW5kb3cgPSB3aW5kb3c7XG5cdH07XG5cblx0dGhpcy5pc0VkaXRvck1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZmxhZ0VkaXRvck1vZGU7XG5cdH07XG5cblx0dGhpcy5hZGRIYW5kbGVyID0gZnVuY3Rpb24oIHdpZGdldFR5cGUsIGNhbGxiYWNrICkge1xuXHRcdHJlZ2lzdGVyZWRIYW5kbGVyc1sgd2lkZ2V0VHlwZSBdID0gY2FsbGJhY2s7XG5cdH07XG5cblx0dGhpcy5hZGRHbG9iYWxIYW5kbGVyID0gZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXHRcdHJlZ2lzdGVyZWRHbG9iYWxIYW5kbGVycy5wdXNoKCBjYWxsYmFjayApO1xuXHR9O1xuXG5cdHRoaXMucnVuUmVhZHlUcmlnZ2VyID0gZnVuY3Rpb24oICRzY29wZSApIHtcblx0XHR2YXIgZWxlbWVudFR5cGUgPSAkc2NvcGUuZGF0YSggJ2VsZW1lbnRfdHlwZScgKTtcblxuXHRcdGlmICggISBlbGVtZW50VHlwZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRydW5HbG9iYWxIYW5kbGVycyggJHNjb3BlICk7XG5cblx0XHRpZiAoICEgcmVnaXN0ZXJlZEhhbmRsZXJzWyBlbGVtZW50VHlwZSBdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHJlZ2lzdGVyZWRIYW5kbGVyc1sgZWxlbWVudFR5cGUgXS5jYWxsKCAkc2NvcGUsICQsIHNjb3BlV2luZG93ICk7XG5cdH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRzSGFuZGxlcjtcbiIsIiggZnVuY3Rpb24oICQgKSB7XG5cdHZhciBFbGVtZW50c0hhbmRsZXIgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2VsZW1lbnRzLWhhbmRsZXInICksXG5cdCAgICBVdGlscyA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvdXRpbHMnICk7XG5cblx0dmFyIEVsZW1lbnRvckZyb250ZW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0dmFyIGVsZW1lbnRzRGVmYXVsdEhhbmRsZXJzID0ge1xuXHRcdFx0YWNjb3JkaW9uOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2FjY29yZGlvbicgKSxcblx0XHRcdGFsZXJ0OiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2FsZXJ0JyApLFxuXHRcdFx0Y291bnRlcjogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9jb3VudGVyJyApLFxuXHRcdFx0J2ltYWdlLWNhcm91c2VsJzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9pbWFnZS1jYXJvdXNlbCcgKSxcblx0XHRcdCdtZW51LWFuY2hvcic6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvbWVudS1hbmNob3InICksXG5cdFx0XHRwcm9ncmVzczogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9wcm9ncmVzcycgKSxcblx0XHRcdHNlY3Rpb246IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvc2VjdGlvbicgKSxcblx0XHRcdHRhYnM6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvdGFicycgKSxcblx0XHRcdHRvZ2dsZTogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy90b2dnbGUnICksXG5cdFx0XHR2aWRlbzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy92aWRlbycgKVxuXHRcdH07XG5cblx0XHR2YXIgYWRkR2xvYmFsSGFuZGxlcnMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuZWxlbWVudHNIYW5kbGVyLmFkZEdsb2JhbEhhbmRsZXIoIHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvZ2xvYmFsJyApICk7XG5cdFx0fTtcblxuXHRcdHZhciBhZGRFbGVtZW50c0hhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkLmVhY2goIGVsZW1lbnRzRGVmYXVsdEhhbmRsZXJzLCBmdW5jdGlvbiggZWxlbWVudE5hbWUgKSB7XG5cdFx0XHRcdHNlbGYuZWxlbWVudHNIYW5kbGVyLmFkZEhhbmRsZXIoIGVsZW1lbnROYW1lLCB0aGlzICk7XG5cdFx0XHR9ICk7XG5cdFx0fTtcblxuXHRcdHZhciBydW5FbGVtZW50c0hhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCAnLmVsZW1lbnRvci1lbGVtZW50JyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmVsZW1lbnRzSGFuZGxlci5ydW5SZWFkeVRyaWdnZXIoICQoIHRoaXMgKSApO1xuXHRcdFx0fSApO1xuXHRcdH07XG5cblx0XHR0aGlzLmVsZW1lbnRzSGFuZGxlciA9IG5ldyBFbGVtZW50c0hhbmRsZXIoICQgKTtcblxuXHRcdHRoaXMudXRpbHMgPSBuZXcgVXRpbHMoICQgKTtcblxuXHRcdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0YWRkR2xvYmFsSGFuZGxlcnMoKTtcblxuXHRcdFx0YWRkRWxlbWVudHNIYW5kbGVycygpO1xuXG5cdFx0XHRzZWxmLnV0aWxzLmluc2VydFlUQXBpKCk7XG5cblx0XHRcdHJ1bkVsZW1lbnRzSGFuZGxlcnMoKTtcblx0XHR9O1xuXHR9O1xuXG5cdHdpbmRvdy5lbGVtZW50b3JGcm9udGVuZCA9IG5ldyBFbGVtZW50b3JGcm9udGVuZCgpO1xufSApKCBqUXVlcnkgKTtcblxualF1ZXJ5KCBlbGVtZW50b3JGcm9udGVuZC5pbml0ICk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0ZGVmYXVsdEFjdGl2ZVNlY3Rpb24gPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci1hY2NvcmRpb24nICkuZGF0YSggJ2FjdGl2ZS1zZWN0aW9uJyApLFxuXHRcdCRhY2NvcmRpb25UaXRsZXMgPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci1hY2NvcmRpb24tdGl0bGUnICksXG5cdFx0JGFjdGl2ZVRpdGxlID0gJGFjY29yZGlvblRpdGxlcy5maWx0ZXIoICcuYWN0aXZlJyApO1xuXG5cdHZhciBhY3RpdmF0ZVNlY3Rpb24gPSBmdW5jdGlvbiggc2VjdGlvbkluZGV4ICkge1xuXHRcdHZhciAkcmVxdWVzdGVkVGl0bGUgPSAkYWNjb3JkaW9uVGl0bGVzLmZpbHRlciggJ1tkYXRhLXNlY3Rpb249XCInICsgc2VjdGlvbkluZGV4ICsgJ1wiXScgKSxcblx0XHRcdGlzUmVxdWVzdGVkQWN0aXZlID0gJHJlcXVlc3RlZFRpdGxlLmhhc0NsYXNzKCAnYWN0aXZlJyApO1xuXG5cdFx0JGFjdGl2ZVRpdGxlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdhY3RpdmUnIClcblx0XHRcdC5uZXh0KClcblx0XHRcdC5zbGlkZVVwKCk7XG5cblx0XHRpZiAoICEgaXNSZXF1ZXN0ZWRBY3RpdmUgKSB7XG5cdFx0XHQkcmVxdWVzdGVkVGl0bGVcblx0XHRcdFx0LmFkZENsYXNzKCAnYWN0aXZlJyApXG5cdFx0XHRcdC5uZXh0KClcblx0XHRcdFx0LnNsaWRlRG93bigpO1xuXG5cdFx0XHQkYWN0aXZlVGl0bGUgPSAkcmVxdWVzdGVkVGl0bGU7XG5cdFx0fVxuXHR9O1xuXG5cdGlmICggISBkZWZhdWx0QWN0aXZlU2VjdGlvbiApIHtcblx0XHRkZWZhdWx0QWN0aXZlU2VjdGlvbiA9IDE7XG5cdH1cblxuXHRhY3RpdmF0ZVNlY3Rpb24oIGRlZmF1bHRBY3RpdmVTZWN0aW9uICk7XG5cblx0JGFjY29yZGlvblRpdGxlcy5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0YWN0aXZhdGVTZWN0aW9uKCB0aGlzLmRhdGFzZXQuc2VjdGlvbiApO1xuXHR9ICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0JCggdGhpcyApLmZpbmQoICcuZWxlbWVudG9yLWFsZXJ0LWRpc21pc3MnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdCQoIHRoaXMgKS5wYXJlbnQoKS5mYWRlT3V0KCk7XG5cdH0pO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdHRoaXMuZmluZCggJy5lbGVtZW50b3ItY291bnRlci1udW1iZXInICkud2F5cG9pbnQoIGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkbnVtYmVyID0gJCggdGhpcyApO1xuXG5cdFx0JG51bWJlci5udW1lcmF0b3IoIHtcblx0XHRcdGR1cmF0aW9uOiAkbnVtYmVyLmRhdGEoICdkdXJhdGlvbicgKVxuXHRcdH0gKTtcblx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmVsZW1lbnRzSGFuZGxlci5pc0VkaXRvck1vZGUoKSApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgJGVsZW1lbnQgPSB0aGlzLFxuXHRcdGFuaW1hdGlvbiA9ICRlbGVtZW50LmRhdGEoICdhbmltYXRpb24nICk7XG5cblx0aWYgKCAhIGFuaW1hdGlvbiApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQkZWxlbWVudC5hZGRDbGFzcyggJ2VsZW1lbnRvci1pbnZpc2libGUnICkucmVtb3ZlQ2xhc3MoIGFuaW1hdGlvbiApO1xuXG5cdCRlbGVtZW50LndheXBvaW50KCBmdW5jdGlvbigpIHtcblx0XHQkZWxlbWVudC5yZW1vdmVDbGFzcyggJ2VsZW1lbnRvci1pbnZpc2libGUnICkuYWRkQ2xhc3MoIGFuaW1hdGlvbiApO1xuXHR9LCB7IG9mZnNldDogJzkwJScgfSApO1xuXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0dmFyICRjYXJvdXNlbCA9ICQoIHRoaXMgKS5maW5kKCAnLmVsZW1lbnRvci1pbWFnZS1jYXJvdXNlbCcgKTtcblx0aWYgKCAhICRjYXJvdXNlbC5sZW5ndGggKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIHNhdmVkT3B0aW9ucyA9ICRjYXJvdXNlbC5kYXRhKCAnc2xpZGVyX29wdGlvbnMnICksXG5cdFx0dGFibGV0U2xpZGVzID0gMSA9PT0gc2F2ZWRPcHRpb25zLnNsaWRlc1RvU2hvdyA/IDEgOiAyLFxuXHRcdGRlZmF1bHRPcHRpb25zID0ge1xuXHRcdFx0cmVzcG9uc2l2ZTogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YnJlYWtwb2ludDogNzY3LFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IHRhYmxldFNsaWRlcyxcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2Nyb2xsOiB0YWJsZXRTbGlkZXNcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVha3BvaW50OiA0ODAsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2hvdzogMSxcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2Nyb2xsOiAxXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSxcblxuXHRcdHNsaWNrT3B0aW9ucyA9ICQuZXh0ZW5kKCB7fSwgZGVmYXVsdE9wdGlvbnMsICRjYXJvdXNlbC5kYXRhKCAnc2xpZGVyX29wdGlvbnMnICkgKTtcblxuXHQkY2Fyb3VzZWwuc2xpY2soIHNsaWNrT3B0aW9ucyApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdGlmICggZWxlbWVudG9yRnJvbnRlbmQuZWxlbWVudHNIYW5kbGVyLmlzRWRpdG9yTW9kZSgpICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciAkYW5jaG9yID0gdGhpcy5maW5kKCAnLmVsZW1lbnRvci1tZW51LWFuY2hvcicgKSxcblx0XHRhbmNob3JJRCA9ICRhbmNob3IuYXR0ciggJ2lkJyApLFxuXHRcdCRhbmNob3JMaW5rcyA9ICQoICdhW2hyZWYqPVwiIycgKyBhbmNob3JJRCArICdcIl0nICksXG5cdFx0JHNjcm9sbGFibGUgPSAkKCAnaHRtbCwgYm9keScgKSxcblx0XHRhZG1pbkJhckhlaWdodCA9ICQoICcjd3BhZG1pbmJhcicgKS5oZWlnaHQoKTtcblxuXHQkYW5jaG9yTGlua3Mub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgaXNTYW1lUGF0aG5hbWUgPSAoIGxvY2F0aW9uLnBhdGhuYW1lID09PSB0aGlzLnBhdGhuYW1lICksXG5cdFx0XHRpc1NhbWVIb3N0bmFtZSA9ICggbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUgKTtcblxuXHRcdGlmICggISBpc1NhbWVIb3N0bmFtZSB8fCAhIGlzU2FtZVBhdGhuYW1lICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQkc2Nyb2xsYWJsZS5hbmltYXRlKCB7XG5cdFx0XHRzY3JvbGxUb3A6ICRhbmNob3Iub2Zmc2V0KCkudG9wIC0gYWRtaW5CYXJIZWlnaHRcblx0XHR9LCAxMDAwICk7XG5cdH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgaW50ZXJ2YWwgPSA4MDtcblxuXHQkKCB0aGlzICkuZmluZCggJy5lbGVtZW50b3ItcHJvZ3Jlc3MtYmFyJyApLndheXBvaW50KCBmdW5jdGlvbigpIHtcblx0XHR2YXIgJHByb2dyZXNzYmFyID0gJCggdGhpcyApLFxuXHRcdFx0bWF4ID0gcGFyc2VJbnQoICRwcm9ncmVzc2Jhci5kYXRhKCAnbWF4JyApLCAxMCApLFxuXHRcdFx0JGlubmVyID0gJHByb2dyZXNzYmFyLm5leHQoKSxcblx0XHRcdCRpbm5lclRleHRXcmFwID0gJGlubmVyLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLXRleHQnICksXG5cdFx0XHQkcGVyY2VudCA9ICRpbm5lci5maW5kKCAnLmVsZW1lbnRvci1wcm9ncmVzcy1wZXJjZW50YWdlJyApLFxuXHRcdFx0aW5uZXJUZXh0ID0gJGlubmVyLmRhdGEoICdpbm5lcicgKSA/ICRpbm5lci5kYXRhKCAnaW5uZXInICkgOiAnJztcblxuXHRcdCRwcm9ncmVzc2Jhci5jc3MoICd3aWR0aCcsIG1heCArICclJyApO1xuXHRcdCRpbm5lci5jc3MoICd3aWR0aCcsIG1heCArICclJyApO1xuXHRcdCRpbm5lclRleHRXcmFwLmh0bWwoIGlubmVyVGV4dCArICcnICk7XG5cdFx0JHBlcmNlbnQuaHRtbCggIG1heCArICclJyApO1xuXG5cdH0sIHsgb2Zmc2V0OiAnOTAlJyB9ICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCwgc2NvcGVXaW5kb3cgKSB7XG5cdHZhciBwbGF5ZXIsXG5cdFx0dWkgPSB7XG5cdFx0XHRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXI6IHRoaXMuZmluZCggJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlby1jb250YWluZXInIClcblx0XHR9LFxuXHRcdGlzWVRWaWRlbyA9IGZhbHNlO1xuXG5cdGlmICggISB1aS5iYWNrZ3JvdW5kVmlkZW9Db250YWluZXIubGVuZ3RoICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHVpLmJhY2tncm91bmRWaWRlbyA9IHVpLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5jaGlsZHJlbiggJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlbycgKTtcblxuXHR2YXIgY2FsY1ZpZGVvc1NpemUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29udGFpbmVyV2lkdGggPSB1aS5iYWNrZ3JvdW5kVmlkZW9Db250YWluZXIub3V0ZXJXaWR0aCgpLFxuXHRcdFx0Y29udGFpbmVySGVpZ2h0ID0gdWkuYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLm91dGVySGVpZ2h0KCksXG5cdFx0XHRhc3BlY3RSYXRpb1NldHRpbmcgPSAnMTY6OScsIC8vVEVNUFxuXHRcdFx0YXNwZWN0UmF0aW9BcnJheSA9IGFzcGVjdFJhdGlvU2V0dGluZy5zcGxpdCggJzonICksXG5cdFx0XHRhc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvQXJyYXlbMF0gLyBhc3BlY3RSYXRpb0FycmF5WzFdLFxuXHRcdFx0cmF0aW9XaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYXNwZWN0UmF0aW8sXG5cdFx0XHRyYXRpb0hlaWdodCA9IGNvbnRhaW5lckhlaWdodCAqIGFzcGVjdFJhdGlvLFxuXHRcdFx0aXNXaWR0aEZpeGVkID0gY29udGFpbmVyV2lkdGggLyBjb250YWluZXJIZWlnaHQgPiBhc3BlY3RSYXRpbztcblxuXHRcdHJldHVybiB7XG5cdFx0XHR3aWR0aDogaXNXaWR0aEZpeGVkID8gY29udGFpbmVyV2lkdGggOiByYXRpb0hlaWdodCxcblx0XHRcdGhlaWdodDogaXNXaWR0aEZpeGVkID8gcmF0aW9XaWR0aCA6IGNvbnRhaW5lckhlaWdodFxuXHRcdH07XG5cdH07XG5cblx0dmFyIGNoYW5nZVZpZGVvU2l6ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkdmlkZW8gPSBpc1lUVmlkZW8gPyAkKCBwbGF5ZXIuZ2V0SWZyYW1lKCkgKSA6IHVpLmJhY2tncm91bmRWaWRlbyxcblx0XHRcdHNpemUgPSBjYWxjVmlkZW9zU2l6ZSgpO1xuXG5cdFx0JHZpZGVvLndpZHRoKCBzaXplLndpZHRoICkuaGVpZ2h0KCBzaXplLmhlaWdodCApO1xuXHR9O1xuXG5cdHZhciBwcmVwYXJlWVRWaWRlbyA9IGZ1bmN0aW9uKCBZVCwgdmlkZW9JRCApIHtcblxuXHRcdHBsYXllciA9IG5ldyBZVC5QbGF5ZXIoIHVpLmJhY2tncm91bmRWaWRlb1swXSwge1xuXHRcdFx0dmlkZW9JZDogdmlkZW9JRCxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRwbGF5ZXIubXV0ZSgpO1xuXG5cdFx0XHRcdFx0Y2hhbmdlVmlkZW9TaXplKCk7XG5cblx0XHRcdFx0XHRwbGF5ZXIucGxheVZpZGVvKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoIGV2ZW50LmRhdGEgPT09IFlULlBsYXllclN0YXRlLkVOREVEICkge1xuXHRcdFx0XHRcdFx0cGxheWVyLnNlZWtUbyggMCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHBsYXllclZhcnM6IHtcblx0XHRcdFx0Y29udHJvbHM6IDAsXG5cdFx0XHRcdHNob3dpbmZvOiAwXG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdH07XG5cblx0dmFyIHZpZGVvSUQgPSB1aS5iYWNrZ3JvdW5kVmlkZW8uZGF0YSggJ3ZpZGVvLWlkJyApO1xuXG5cdGlmICggdmlkZW9JRCApIHtcblx0XHRpc1lUVmlkZW8gPSB0cnVlO1xuXG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQudXRpbHMub25Zb3V0dWJlQXBpUmVhZHkoIGZ1bmN0aW9uKCBZVCApIHtcblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRwcmVwYXJlWVRWaWRlbyggWVQsIHZpZGVvSUQgKTtcblx0XHRcdH0sIDEgKTtcblx0XHR9ICk7XG5cdH0gZWxzZSB7XG5cdFx0dWkuYmFja2dyb3VuZFZpZGVvLm9uZSggJ2NhbnBsYXknLCBjaGFuZ2VWaWRlb1NpemUgKTtcblx0fVxuXG5cdCQoIHNjb3BlV2luZG93ICkub24oICdyZXNpemUnLCBjaGFuZ2VWaWRlb1NpemUgKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkICkge1xuXHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0ZGVmYXVsdEFjdGl2ZVRhYiA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLXRhYnMnICkuZGF0YSggJ2FjdGl2ZS10YWInICksXG5cdFx0JHRhYnNUaXRsZXMgPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci10YWItdGl0bGUnICksXG5cdFx0JHRhYnMgPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci10YWItY29udGVudCcgKSxcblx0XHQkYWN0aXZlLFxuXHRcdCRjb250ZW50O1xuXG5cdGlmICggISBkZWZhdWx0QWN0aXZlVGFiICkge1xuXHRcdGRlZmF1bHRBY3RpdmVUYWIgPSAxO1xuXHR9XG5cblx0dmFyIGFjdGl2YXRlVGFiID0gZnVuY3Rpb24oIHRhYkluZGV4ICkge1xuXHRcdGlmICggJGFjdGl2ZSApIHtcblx0XHRcdCRhY3RpdmUucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG5cblx0XHRcdCRjb250ZW50LmhpZGUoKTtcblx0XHR9XG5cblx0XHQkYWN0aXZlID0gJHRhYnNUaXRsZXMuZmlsdGVyKCAnW2RhdGEtdGFiPVwiJyArIHRhYkluZGV4ICsgJ1wiXScgKTtcblxuXHRcdCRhY3RpdmUuYWRkQ2xhc3MoICdhY3RpdmUnICk7XG5cblx0XHQkY29udGVudCA9ICR0YWJzLmZpbHRlciggJ1tkYXRhLXRhYj1cIicgKyB0YWJJbmRleCArICdcIl0nICk7XG5cblx0XHQkY29udGVudC5zaG93KCk7XG5cdH07XG5cblx0YWN0aXZhdGVUYWIoIGRlZmF1bHRBY3RpdmVUYWIgKTtcblxuXHQkdGFic1RpdGxlcy5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0YWN0aXZhdGVUYWIoIHRoaXMuZGF0YXNldC50YWIgKTtcblx0fSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICQgKSB7XG5cdHZhciAkdG9nZ2xlVGl0bGVzID0gJCggdGhpcyApLmZpbmQoICcuZWxlbWVudG9yLXRvZ2dsZS10aXRsZScgKTtcblxuXHQkdG9nZ2xlVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGFjdGl2ZSA9ICQoIHRoaXMgKSxcblx0XHRcdCRjb250ZW50ID0gJGFjdGl2ZS5uZXh0KCk7XG5cblx0XHRpZiAoICRhY3RpdmUuaGFzQ2xhc3MoICdhY3RpdmUnICkgKSB7XG5cdFx0XHQkYWN0aXZlLnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApO1xuXHRcdFx0JGNvbnRlbnQuc2xpZGVVcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkYWN0aXZlLmFkZENsYXNzKCAnYWN0aXZlJyApO1xuXHRcdFx0JGNvbnRlbnQuc2xpZGVEb3duKCk7XG5cdFx0fVxuXHR9ICk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJCApIHtcblx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdCRpbWFnZU92ZXJsYXkgPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci1jdXN0b20tZW1iZWQtaW1hZ2Utb3ZlcmxheScgKSxcblx0XHQkdmlkZW9GcmFtZSA9ICR0aGlzLmZpbmQoICdpZnJhbWUnICk7XG5cblx0aWYgKCAhICRpbWFnZU92ZXJsYXkubGVuZ3RoICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdCRpbWFnZU92ZXJsYXkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdCRpbWFnZU92ZXJsYXkucmVtb3ZlKCk7XG5cdFx0dmFyIG5ld1NvdXJjZVVybCA9ICR2aWRlb0ZyYW1lWzBdLnNyYztcblx0XHQvLyBSZW1vdmUgb2xkIGF1dG9wbGF5IGlmIGV4aXN0c1xuXHRcdG5ld1NvdXJjZVVybCA9IG5ld1NvdXJjZVVybC5yZXBsYWNlKCAnJmF1dG9wbGF5PTAnLCAnJyApO1xuXG5cdFx0JHZpZGVvRnJhbWVbMF0uc3JjID0gbmV3U291cmNlVXJsICsgJyZhdXRvcGxheT0xJztcblx0fSApO1xufTtcbiIsInZhciBVdGlscztcblxuVXRpbHMgPSBmdW5jdGlvbiggJCApIHtcblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdHRoaXMub25Zb3V0dWJlQXBpUmVhZHkgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCB3aW5kb3cuWVQgJiYgWVQubG9hZGVkICkge1xuXHRcdFx0Y2FsbGJhY2soIFlUICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIElmIG5vdCByZWFkeSBjaGVjayBhZ2FpbiBieSB0aW1lb3V0Li5cblx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLm9uWW91dHViZUFwaVJlYWR5KCBjYWxsYmFjayApO1xuXHRcdFx0fSwgMzUwICk7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuaW5zZXJ0WVRBcGkgPSBmdW5jdGlvbigpIHtcblx0XHQkKCAnc2NyaXB0OmZpcnN0JyApLmJlZm9yZSggICQoICc8c2NyaXB0PicsIHsgc3JjOiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaScgfSApICk7XG5cdH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzO1xuIl19
