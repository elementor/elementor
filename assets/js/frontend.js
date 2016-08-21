(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function( $, window ) {
	'use strict';

	// The closest window
	var scopeWindow = window;

	var elementorBindUI = ( function() {
		var _registeredBindEvent = {},
			_registeredGlobalHandlers = [],
			_flagEditorMode = false,

			_setEditorMode = function( mode ) {
				_flagEditorMode = mode;
			},

			_setScopeWindow = function( window ) {
				scopeWindow = window;
			},

			_isEditorMode = function() {
				return _flagEditorMode;
			},

			_addBindEvent = function( widgetType, callback ) {
				_registeredBindEvent[ widgetType ] = callback;
			},

			_addGlobalHandler = function( callback ) {
				_registeredGlobalHandlers.push( callback );
			},

			_runGlobalHandlers = function( $scope ) {
				$.each( _registeredGlobalHandlers, function() {
					this.call( $scope );
				} );
			},

			_runReadyTrigger = function( $scope ) {
				var elementType = $scope.data( 'element_type' );

				if ( ! elementType ) {
					return;
				}

				_runGlobalHandlers( $scope );

				if ( ! _registeredBindEvent[ elementType ] ) {
					return;
				}

				_registeredBindEvent[ elementType ].call( $scope );
			};

		// Public Members
		return {
			isEditorMode: _isEditorMode,
			setEditorMode: _setEditorMode,
			setScopeWindow: _setScopeWindow,
			addBindEvent: _addBindEvent,
			addGlobalHandler: _addGlobalHandler,
			runReadyTrigger: _runReadyTrigger
		};
	} )();

	var onYoutubeApiReady = function( callback ) {
		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				onYoutubeApiReady( callback );
			}, 350 );
		}
	};

	elementorBindUI.addGlobalHandler( function() {
		if ( elementorBindUI.isEditorMode() ) {
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

	} );
	/**
	 * Add JS widgets here
	 */
	elementorBindUI.addBindEvent( 'counter', function() {
		this.find( '.elementor-counter-number' ).waypoint( function() {
			var $number = $( this );

			$number.numerator( {
				duration: $number.data( 'duration' )
			} );
		}, { offset: '90%' } );
	} );

	// Progress Bar Widget
	elementorBindUI.addBindEvent( 'progress', function() {
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
	} );

	// Tabs Widget
	elementorBindUI.addBindEvent( 'tabs', function() {
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
	} );

	// Accordion Widget
	elementorBindUI.addBindEvent( 'accordion', function() {
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
	} );

	// Toggle Widget
	elementorBindUI.addBindEvent( 'toggle', function() {
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
	} );

	// Carousel Widget
	elementorBindUI.addBindEvent( 'image-carousel', function() {
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
	} );

	// Alert Widget
	elementorBindUI.addBindEvent( 'alert', function() {
		$( this ).find( '.elementor-alert-dismiss' ).on( 'click', function() {
			$( this ).parent().fadeOut();
		});
	} );

	// Section
	elementorBindUI.addBindEvent( 'section', function() {
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

			onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			ui.backgroundVideo.one( 'canplay', changeVideoSize );
		}

		$( scopeWindow ).on( 'resize', changeVideoSize );
	} );

	// Video Widget
	elementorBindUI.addBindEvent( 'video', function() {
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
	} );

	elementorBindUI.addBindEvent( 'menu-anchor', function() {
		if ( elementorBindUI.isEditorMode() ) {
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
	} );

	// Make sure it's a global variable
	window.elementorBindUI = elementorBindUI;
} )( jQuery, window );

jQuery( function( $ ) {
	// Enqueue YouTube API
	var scriptTag = document.createElement( 'script' ),
		firstElementScript = document.getElementsByTagName( 'script' )[0];

	scriptTag.src = 'https://www.youtube.com/iframe_api';
	firstElementScript.parentNode.insertBefore( scriptTag, firstElementScript );

	$( '.elementor-element' ).each( function() {
		elementorBindUI.runReadyTrigger( $( this ) );
	} );
} );

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2Zyb250ZW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiggZnVuY3Rpb24oICQsIHdpbmRvdyApIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8vIFRoZSBjbG9zZXN0IHdpbmRvd1xuXHR2YXIgc2NvcGVXaW5kb3cgPSB3aW5kb3c7XG5cblx0dmFyIGVsZW1lbnRvckJpbmRVSSA9ICggZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF9yZWdpc3RlcmVkQmluZEV2ZW50ID0ge30sXG5cdFx0XHRfcmVnaXN0ZXJlZEdsb2JhbEhhbmRsZXJzID0gW10sXG5cdFx0XHRfZmxhZ0VkaXRvck1vZGUgPSBmYWxzZSxcblxuXHRcdFx0X3NldEVkaXRvck1vZGUgPSBmdW5jdGlvbiggbW9kZSApIHtcblx0XHRcdFx0X2ZsYWdFZGl0b3JNb2RlID0gbW9kZTtcblx0XHRcdH0sXG5cblx0XHRcdF9zZXRTY29wZVdpbmRvdyA9IGZ1bmN0aW9uKCB3aW5kb3cgKSB7XG5cdFx0XHRcdHNjb3BlV2luZG93ID0gd2luZG93O1xuXHRcdFx0fSxcblxuXHRcdFx0X2lzRWRpdG9yTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gX2ZsYWdFZGl0b3JNb2RlO1xuXHRcdFx0fSxcblxuXHRcdFx0X2FkZEJpbmRFdmVudCA9IGZ1bmN0aW9uKCB3aWRnZXRUeXBlLCBjYWxsYmFjayApIHtcblx0XHRcdFx0X3JlZ2lzdGVyZWRCaW5kRXZlbnRbIHdpZGdldFR5cGUgXSA9IGNhbGxiYWNrO1xuXHRcdFx0fSxcblxuXHRcdFx0X2FkZEdsb2JhbEhhbmRsZXIgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdF9yZWdpc3RlcmVkR2xvYmFsSGFuZGxlcnMucHVzaCggY2FsbGJhY2sgKTtcblx0XHRcdH0sXG5cblx0XHRcdF9ydW5HbG9iYWxIYW5kbGVycyA9IGZ1bmN0aW9uKCAkc2NvcGUgKSB7XG5cdFx0XHRcdCQuZWFjaCggX3JlZ2lzdGVyZWRHbG9iYWxIYW5kbGVycywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5jYWxsKCAkc2NvcGUgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblxuXHRcdFx0X3J1blJlYWR5VHJpZ2dlciA9IGZ1bmN0aW9uKCAkc2NvcGUgKSB7XG5cdFx0XHRcdHZhciBlbGVtZW50VHlwZSA9ICRzY29wZS5kYXRhKCAnZWxlbWVudF90eXBlJyApO1xuXG5cdFx0XHRcdGlmICggISBlbGVtZW50VHlwZSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfcnVuR2xvYmFsSGFuZGxlcnMoICRzY29wZSApO1xuXG5cdFx0XHRcdGlmICggISBfcmVnaXN0ZXJlZEJpbmRFdmVudFsgZWxlbWVudFR5cGUgXSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfcmVnaXN0ZXJlZEJpbmRFdmVudFsgZWxlbWVudFR5cGUgXS5jYWxsKCAkc2NvcGUgKTtcblx0XHRcdH07XG5cblx0XHQvLyBQdWJsaWMgTWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0VkaXRvck1vZGU6IF9pc0VkaXRvck1vZGUsXG5cdFx0XHRzZXRFZGl0b3JNb2RlOiBfc2V0RWRpdG9yTW9kZSxcblx0XHRcdHNldFNjb3BlV2luZG93OiBfc2V0U2NvcGVXaW5kb3csXG5cdFx0XHRhZGRCaW5kRXZlbnQ6IF9hZGRCaW5kRXZlbnQsXG5cdFx0XHRhZGRHbG9iYWxIYW5kbGVyOiBfYWRkR2xvYmFsSGFuZGxlcixcblx0XHRcdHJ1blJlYWR5VHJpZ2dlcjogX3J1blJlYWR5VHJpZ2dlclxuXHRcdH07XG5cdH0gKSgpO1xuXG5cdHZhciBvbllvdXR1YmVBcGlSZWFkeSA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcblx0XHRpZiAoIHdpbmRvdy5ZVCAmJiBZVC5sb2FkZWQgKSB7XG5cdFx0XHRjYWxsYmFjayggWVQgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbm90IHJlYWR5IGNoZWNrIGFnYWluIGJ5IHRpbWVvdXQuLlxuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdG9uWW91dHViZUFwaVJlYWR5KCBjYWxsYmFjayApO1xuXHRcdFx0fSwgMzUwICk7XG5cdFx0fVxuXHR9O1xuXG5cdGVsZW1lbnRvckJpbmRVSS5hZGRHbG9iYWxIYW5kbGVyKCBmdW5jdGlvbigpIHtcblx0XHRpZiAoIGVsZW1lbnRvckJpbmRVSS5pc0VkaXRvck1vZGUoKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgJGVsZW1lbnQgPSB0aGlzLFxuXHRcdFx0YW5pbWF0aW9uID0gJGVsZW1lbnQuZGF0YSggJ2FuaW1hdGlvbicgKTtcblxuXHRcdGlmICggISBhbmltYXRpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGVsZW1lbnQuYWRkQ2xhc3MoICdlbGVtZW50b3ItaW52aXNpYmxlJyApLnJlbW92ZUNsYXNzKCBhbmltYXRpb24gKTtcblxuXHRcdCRlbGVtZW50LndheXBvaW50KCBmdW5jdGlvbigpIHtcblx0XHRcdCRlbGVtZW50LnJlbW92ZUNsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZScgKS5hZGRDbGFzcyggYW5pbWF0aW9uICk7XG5cdFx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcblxuXHR9ICk7XG5cdC8qKlxuXHQgKiBBZGQgSlMgd2lkZ2V0cyBoZXJlXG5cdCAqL1xuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnY291bnRlcicsIGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZmluZCggJy5lbGVtZW50b3ItY291bnRlci1udW1iZXInICkud2F5cG9pbnQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyICRudW1iZXIgPSAkKCB0aGlzICk7XG5cblx0XHRcdCRudW1iZXIubnVtZXJhdG9yKCB7XG5cdFx0XHRcdGR1cmF0aW9uOiAkbnVtYmVyLmRhdGEoICdkdXJhdGlvbicgKVxuXHRcdFx0fSApO1xuXHRcdH0sIHsgb2Zmc2V0OiAnOTAlJyB9ICk7XG5cdH0gKTtcblxuXHQvLyBQcm9ncmVzcyBCYXIgV2lkZ2V0XG5cdGVsZW1lbnRvckJpbmRVSS5hZGRCaW5kRXZlbnQoICdwcm9ncmVzcycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbnRlcnZhbCA9IDgwO1xuXG5cdFx0JCggdGhpcyApLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLWJhcicgKS53YXlwb2ludCggZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgJHByb2dyZXNzYmFyID0gJCggdGhpcyApLFxuXHRcdFx0XHRtYXggPSBwYXJzZUludCggJHByb2dyZXNzYmFyLmRhdGEoICdtYXgnICksIDEwICksXG5cdFx0XHRcdCRpbm5lciA9ICRwcm9ncmVzc2Jhci5uZXh0KCksXG5cdFx0XHRcdCRpbm5lclRleHRXcmFwID0gJGlubmVyLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLXRleHQnICksXG5cdFx0XHRcdCRwZXJjZW50ID0gJGlubmVyLmZpbmQoICcuZWxlbWVudG9yLXByb2dyZXNzLXBlcmNlbnRhZ2UnICksXG5cdFx0XHRcdGlubmVyVGV4dCA9ICRpbm5lci5kYXRhKCAnaW5uZXInICkgPyAkaW5uZXIuZGF0YSggJ2lubmVyJyApIDogJyc7XG5cblx0XHRcdCRwcm9ncmVzc2Jhci5jc3MoICd3aWR0aCcsIG1heCArICclJyApO1xuXHRcdFx0JGlubmVyLmNzcyggJ3dpZHRoJywgbWF4ICsgJyUnICk7XG5cdFx0XHQkaW5uZXJUZXh0V3JhcC5odG1sKCBpbm5lclRleHQgKyAnJyApO1xuXHRcdFx0JHBlcmNlbnQuaHRtbCggIG1heCArICclJyApO1xuXG5cdFx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcblx0fSApO1xuXG5cdC8vIFRhYnMgV2lkZ2V0XG5cdGVsZW1lbnRvckJpbmRVSS5hZGRCaW5kRXZlbnQoICd0YWJzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0ZGVmYXVsdEFjdGl2ZVRhYiA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLXRhYnMnICkuZGF0YSggJ2FjdGl2ZS10YWInICksXG5cdFx0XHQkdGFic1RpdGxlcyA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLXRhYi10aXRsZScgKSxcblx0XHRcdCR0YWJzID0gJHRoaXMuZmluZCggJy5lbGVtZW50b3ItdGFiLWNvbnRlbnQnICksXG5cdFx0XHQkYWN0aXZlLFxuXHRcdFx0JGNvbnRlbnQ7XG5cblx0XHRpZiAoICEgZGVmYXVsdEFjdGl2ZVRhYiApIHtcblx0XHRcdGRlZmF1bHRBY3RpdmVUYWIgPSAxO1xuXHRcdH1cblxuXHRcdHZhciBhY3RpdmF0ZVRhYiA9IGZ1bmN0aW9uKCB0YWJJbmRleCApIHtcblx0XHRcdGlmICggJGFjdGl2ZSApIHtcblx0XHRcdFx0JGFjdGl2ZS5yZW1vdmVDbGFzcyggJ2FjdGl2ZScgKTtcblxuXHRcdFx0XHQkY29udGVudC5oaWRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdCRhY3RpdmUgPSAkdGFic1RpdGxlcy5maWx0ZXIoICdbZGF0YS10YWI9XCInICsgdGFiSW5kZXggKyAnXCJdJyApO1xuXG5cdFx0XHQkYWN0aXZlLmFkZENsYXNzKCAnYWN0aXZlJyApO1xuXG5cdFx0XHQkY29udGVudCA9ICR0YWJzLmZpbHRlciggJ1tkYXRhLXRhYj1cIicgKyB0YWJJbmRleCArICdcIl0nICk7XG5cblx0XHRcdCRjb250ZW50LnNob3coKTtcblx0XHR9O1xuXG5cdFx0YWN0aXZhdGVUYWIoIGRlZmF1bHRBY3RpdmVUYWIgKTtcblxuXHRcdCR0YWJzVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdGFjdGl2YXRlVGFiKCB0aGlzLmRhdGFzZXQudGFiICk7XG5cdFx0fSApO1xuXHR9ICk7XG5cblx0Ly8gQWNjb3JkaW9uIFdpZGdldFxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnYWNjb3JkaW9uJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyICR0aGlzID0gJCggdGhpcyApLFxuXHRcdFx0ZGVmYXVsdEFjdGl2ZVNlY3Rpb24gPSAkdGhpcy5maW5kKCAnLmVsZW1lbnRvci1hY2NvcmRpb24nICkuZGF0YSggJ2FjdGl2ZS1zZWN0aW9uJyApLFxuXHRcdFx0JGFjY29yZGlvblRpdGxlcyA9ICR0aGlzLmZpbmQoICcuZWxlbWVudG9yLWFjY29yZGlvbi10aXRsZScgKSxcblx0XHRcdCRhY3RpdmVUaXRsZSA9ICRhY2NvcmRpb25UaXRsZXMuZmlsdGVyKCAnLmFjdGl2ZScgKTtcblxuXHRcdHZhciBhY3RpdmF0ZVNlY3Rpb24gPSBmdW5jdGlvbiggc2VjdGlvbkluZGV4ICkge1xuXHRcdFx0dmFyICRyZXF1ZXN0ZWRUaXRsZSA9ICRhY2NvcmRpb25UaXRsZXMuZmlsdGVyKCAnW2RhdGEtc2VjdGlvbj1cIicgKyBzZWN0aW9uSW5kZXggKyAnXCJdJyApLFxuXHRcdFx0XHRpc1JlcXVlc3RlZEFjdGl2ZSA9ICRyZXF1ZXN0ZWRUaXRsZS5oYXNDbGFzcyggJ2FjdGl2ZScgKTtcblxuXHRcdFx0JGFjdGl2ZVRpdGxlXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggJ2FjdGl2ZScgKVxuXHRcdFx0XHQubmV4dCgpXG5cdFx0XHRcdC5zbGlkZVVwKCk7XG5cblx0XHRcdGlmICggISBpc1JlcXVlc3RlZEFjdGl2ZSApIHtcblx0XHRcdFx0JHJlcXVlc3RlZFRpdGxlXG5cdFx0XHRcdFx0LmFkZENsYXNzKCAnYWN0aXZlJyApXG5cdFx0XHRcdFx0Lm5leHQoKVxuXHRcdFx0XHRcdC5zbGlkZURvd24oKTtcblxuXHRcdFx0XHQkYWN0aXZlVGl0bGUgPSAkcmVxdWVzdGVkVGl0bGU7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmICggISBkZWZhdWx0QWN0aXZlU2VjdGlvbiApIHtcblx0XHRcdGRlZmF1bHRBY3RpdmVTZWN0aW9uID0gMTtcblx0XHR9XG5cblx0XHRhY3RpdmF0ZVNlY3Rpb24oIGRlZmF1bHRBY3RpdmVTZWN0aW9uICk7XG5cblx0XHQkYWNjb3JkaW9uVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdGFjdGl2YXRlU2VjdGlvbiggdGhpcy5kYXRhc2V0LnNlY3Rpb24gKTtcblx0XHR9ICk7XG5cdH0gKTtcblxuXHQvLyBUb2dnbGUgV2lkZ2V0XG5cdGVsZW1lbnRvckJpbmRVSS5hZGRCaW5kRXZlbnQoICd0b2dnbGUnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgJHRvZ2dsZVRpdGxlcyA9ICQoIHRoaXMgKS5maW5kKCAnLmVsZW1lbnRvci10b2dnbGUtdGl0bGUnICk7XG5cblx0XHQkdG9nZ2xlVGl0bGVzLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkYWN0aXZlID0gJCggdGhpcyApLFxuXHRcdFx0XHQkY29udGVudCA9ICRhY3RpdmUubmV4dCgpO1xuXG5cdFx0XHRpZiAoICRhY3RpdmUuaGFzQ2xhc3MoICdhY3RpdmUnICkgKSB7XG5cdFx0XHRcdCRhY3RpdmUucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHRcdCRjb250ZW50LnNsaWRlVXAoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRhY3RpdmUuYWRkQ2xhc3MoICdhY3RpdmUnICk7XG5cdFx0XHRcdCRjb250ZW50LnNsaWRlRG93bigpO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSApO1xuXG5cdC8vIENhcm91c2VsIFdpZGdldFxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnaW1hZ2UtY2Fyb3VzZWwnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGNhcm91c2VsID0gJCggdGhpcyApLmZpbmQoICcuZWxlbWVudG9yLWltYWdlLWNhcm91c2VsJyApO1xuXHRcdGlmICggISAkY2Fyb3VzZWwubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBzYXZlZE9wdGlvbnMgPSAkY2Fyb3VzZWwuZGF0YSggJ3NsaWRlcl9vcHRpb25zJyApLFxuXHRcdFx0dGFibGV0U2xpZGVzID0gMSA9PT0gc2F2ZWRPcHRpb25zLnNsaWRlc1RvU2hvdyA/IDEgOiAyLFxuXHRcdFx0ZGVmYXVsdE9wdGlvbnMgPSB7XG5cdFx0XHRcdHJlc3BvbnNpdmU6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRicmVha3BvaW50OiA3NjcsXG5cdFx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0XHRzbGlkZXNUb1Nob3c6IHRhYmxldFNsaWRlcyxcblx0XHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IHRhYmxldFNsaWRlc1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YnJlYWtwb2ludDogNDgwLFxuXHRcdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiAxLFxuXHRcdFx0XHRcdFx0XHRzbGlkZXNUb1Njcm9sbDogMVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XVxuXHRcdFx0fSxcblxuXHRcdFx0c2xpY2tPcHRpb25zID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0T3B0aW9ucywgJGNhcm91c2VsLmRhdGEoICdzbGlkZXJfb3B0aW9ucycgKSApO1xuXG5cdFx0JGNhcm91c2VsLnNsaWNrKCBzbGlja09wdGlvbnMgKTtcblx0fSApO1xuXG5cdC8vIEFsZXJ0IFdpZGdldFxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnYWxlcnQnLCBmdW5jdGlvbigpIHtcblx0XHQkKCB0aGlzICkuZmluZCggJy5lbGVtZW50b3ItYWxlcnQtZGlzbWlzcycgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCB0aGlzICkucGFyZW50KCkuZmFkZU91dCgpO1xuXHRcdH0pO1xuXHR9ICk7XG5cblx0Ly8gU2VjdGlvblxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnc2VjdGlvbicsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwbGF5ZXIsXG5cdFx0XHR1aSA9IHtcblx0XHRcdFx0YmFja2dyb3VuZFZpZGVvQ29udGFpbmVyOiB0aGlzLmZpbmQoICcuZWxlbWVudG9yLWJhY2tncm91bmQtdmlkZW8tY29udGFpbmVyJyApXG5cdFx0XHR9LFxuXHRcdFx0aXNZVFZpZGVvID0gZmFsc2U7XG5cblx0XHRpZiAoICEgdWkuYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLmxlbmd0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR1aS5iYWNrZ3JvdW5kVmlkZW8gPSB1aS5iYWNrZ3JvdW5kVmlkZW9Db250YWluZXIuY2hpbGRyZW4oICcuZWxlbWVudG9yLWJhY2tncm91bmQtdmlkZW8nICk7XG5cblx0XHR2YXIgY2FsY1ZpZGVvc1NpemUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBjb250YWluZXJXaWR0aCA9IHVpLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5vdXRlcldpZHRoKCksXG5cdFx0XHRcdGNvbnRhaW5lckhlaWdodCA9IHVpLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuXHRcdFx0XHRhc3BlY3RSYXRpb1NldHRpbmcgPSAnMTY6OScsIC8vVEVNUFxuXHRcdFx0XHRhc3BlY3RSYXRpb0FycmF5ID0gYXNwZWN0UmF0aW9TZXR0aW5nLnNwbGl0KCAnOicgKSxcblx0XHRcdFx0YXNwZWN0UmF0aW8gPSBhc3BlY3RSYXRpb0FycmF5WzBdIC8gYXNwZWN0UmF0aW9BcnJheVsxXSxcblx0XHRcdFx0cmF0aW9XaWR0aCA9IGNvbnRhaW5lcldpZHRoIC8gYXNwZWN0UmF0aW8sXG5cdFx0XHRcdHJhdGlvSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0ICogYXNwZWN0UmF0aW8sXG5cdFx0XHRcdGlzV2lkdGhGaXhlZCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0ID4gYXNwZWN0UmF0aW87XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHdpZHRoOiBpc1dpZHRoRml4ZWQgPyBjb250YWluZXJXaWR0aCA6IHJhdGlvSGVpZ2h0LFxuXHRcdFx0XHRoZWlnaHQ6IGlzV2lkdGhGaXhlZCA/IHJhdGlvV2lkdGggOiBjb250YWluZXJIZWlnaHRcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdHZhciBjaGFuZ2VWaWRlb1NpemUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkdmlkZW8gPSBpc1lUVmlkZW8gPyAkKCBwbGF5ZXIuZ2V0SWZyYW1lKCkgKSA6IHVpLmJhY2tncm91bmRWaWRlbyxcblx0XHRcdFx0c2l6ZSA9IGNhbGNWaWRlb3NTaXplKCk7XG5cblx0XHRcdCR2aWRlby53aWR0aCggc2l6ZS53aWR0aCApLmhlaWdodCggc2l6ZS5oZWlnaHQgKTtcblx0XHR9O1xuXG5cdFx0dmFyIHByZXBhcmVZVFZpZGVvID0gZnVuY3Rpb24oIFlULCB2aWRlb0lEICkge1xuXG5cdFx0XHRwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCB1aS5iYWNrZ3JvdW5kVmlkZW9bMF0sIHtcblx0XHRcdFx0dmlkZW9JZDogdmlkZW9JRCxcblx0XHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdFx0b25SZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRwbGF5ZXIubXV0ZSgpO1xuXG5cdFx0XHRcdFx0XHRjaGFuZ2VWaWRlb1NpemUoKTtcblxuXHRcdFx0XHRcdFx0cGxheWVyLnBsYXlWaWRlbygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25TdGF0ZUNoYW5nZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdFx0aWYgKCBldmVudC5kYXRhID09PSBZVC5QbGF5ZXJTdGF0ZS5FTkRFRCApIHtcblx0XHRcdFx0XHRcdFx0cGxheWVyLnNlZWtUbyggMCApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cGxheWVyVmFyczoge1xuXHRcdFx0XHRcdGNvbnRyb2xzOiAwLFxuXHRcdFx0XHRcdHNob3dpbmZvOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHRcdH07XG5cblx0XHR2YXIgdmlkZW9JRCA9IHVpLmJhY2tncm91bmRWaWRlby5kYXRhKCAndmlkZW8taWQnICk7XG5cblx0XHRpZiAoIHZpZGVvSUQgKSB7XG5cdFx0XHRpc1lUVmlkZW8gPSB0cnVlO1xuXG5cdFx0XHRvbllvdXR1YmVBcGlSZWFkeSggZnVuY3Rpb24oIFlUICkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRwcmVwYXJlWVRWaWRlbyggWVQsIHZpZGVvSUQgKTtcblx0XHRcdFx0fSwgMSApO1xuXHRcdFx0fSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR1aS5iYWNrZ3JvdW5kVmlkZW8ub25lKCAnY2FucGxheScsIGNoYW5nZVZpZGVvU2l6ZSApO1xuXHRcdH1cblxuXHRcdCQoIHNjb3BlV2luZG93ICkub24oICdyZXNpemUnLCBjaGFuZ2VWaWRlb1NpemUgKTtcblx0fSApO1xuXG5cdC8vIFZpZGVvIFdpZGdldFxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAndmlkZW8nLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgJHRoaXMgPSAkKCB0aGlzICksXG5cdFx0XHQkaW1hZ2VPdmVybGF5ID0gJHRoaXMuZmluZCggJy5lbGVtZW50b3ItY3VzdG9tLWVtYmVkLWltYWdlLW92ZXJsYXknICksXG5cdFx0XHQkdmlkZW9GcmFtZSA9ICR0aGlzLmZpbmQoICdpZnJhbWUnICk7XG5cblx0XHRpZiAoICEgJGltYWdlT3ZlcmxheS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGltYWdlT3ZlcmxheS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHQkaW1hZ2VPdmVybGF5LnJlbW92ZSgpO1xuXHRcdFx0dmFyIG5ld1NvdXJjZVVybCA9ICR2aWRlb0ZyYW1lWzBdLnNyYztcblx0XHRcdC8vIFJlbW92ZSBvbGQgYXV0b3BsYXkgaWYgZXhpc3RzXG5cdFx0XHRuZXdTb3VyY2VVcmwgPSBuZXdTb3VyY2VVcmwucmVwbGFjZSggJyZhdXRvcGxheT0wJywgJycgKTtcblxuXHRcdFx0JHZpZGVvRnJhbWVbMF0uc3JjID0gbmV3U291cmNlVXJsICsgJyZhdXRvcGxheT0xJztcblx0XHR9ICk7XG5cdH0gKTtcblxuXHRlbGVtZW50b3JCaW5kVUkuYWRkQmluZEV2ZW50KCAnbWVudS1hbmNob3InLCBmdW5jdGlvbigpIHtcblx0XHRpZiAoIGVsZW1lbnRvckJpbmRVSS5pc0VkaXRvck1vZGUoKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgJGFuY2hvciA9IHRoaXMuZmluZCggJy5lbGVtZW50b3ItbWVudS1hbmNob3InICksXG5cdFx0XHRhbmNob3JJRCA9ICRhbmNob3IuYXR0ciggJ2lkJyApLFxuXHRcdFx0JGFuY2hvckxpbmtzID0gJCggJ2FbaHJlZio9XCIjJyArIGFuY2hvcklEICsgJ1wiXScgKSxcblx0XHRcdCRzY3JvbGxhYmxlID0gJCggJ2h0bWwsIGJvZHknICksXG5cdFx0XHRhZG1pbkJhckhlaWdodCA9ICQoICcjd3BhZG1pbmJhcicgKS5oZWlnaHQoKTtcblxuXHRcdCRhbmNob3JMaW5rcy5vbiggJ2NsaWNrJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGlzU2FtZVBhdGhuYW1lID0gKCBsb2NhdGlvbi5wYXRobmFtZSA9PT0gdGhpcy5wYXRobmFtZSApLFxuXHRcdFx0XHRpc1NhbWVIb3N0bmFtZSA9ICggbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUgKTtcblxuXHRcdFx0aWYgKCAhIGlzU2FtZUhvc3RuYW1lIHx8ICEgaXNTYW1lUGF0aG5hbWUgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JHNjcm9sbGFibGUuYW5pbWF0ZSgge1xuXHRcdFx0XHRzY3JvbGxUb3A6ICRhbmNob3Iub2Zmc2V0KCkudG9wIC0gYWRtaW5CYXJIZWlnaHRcblx0XHRcdH0sIDEwMDAgKTtcblx0XHR9ICk7XG5cdH0gKTtcblxuXHQvLyBNYWtlIHN1cmUgaXQncyBhIGdsb2JhbCB2YXJpYWJsZVxuXHR3aW5kb3cuZWxlbWVudG9yQmluZFVJID0gZWxlbWVudG9yQmluZFVJO1xufSApKCBqUXVlcnksIHdpbmRvdyApO1xuXG5qUXVlcnkoIGZ1bmN0aW9uKCAkICkge1xuXHQvLyBFbnF1ZXVlIFlvdVR1YmUgQVBJXG5cdHZhciBzY3JpcHRUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2NyaXB0JyApLFxuXHRcdGZpcnN0RWxlbWVudFNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCAnc2NyaXB0JyApWzBdO1xuXG5cdHNjcmlwdFRhZy5zcmMgPSAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaSc7XG5cdGZpcnN0RWxlbWVudFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggc2NyaXB0VGFnLCBmaXJzdEVsZW1lbnRTY3JpcHQgKTtcblxuXHQkKCAnLmVsZW1lbnRvci1lbGVtZW50JyApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdGVsZW1lbnRvckJpbmRVSS5ydW5SZWFkeVRyaWdnZXIoICQoIHRoaXMgKSApO1xuXHR9ICk7XG59ICk7XG4iXX0=
