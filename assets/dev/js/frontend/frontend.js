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
