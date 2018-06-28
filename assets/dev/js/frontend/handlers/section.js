var HandlerModule = require( 'elementor-frontend/handler-module' );

var BackgroundVideo = HandlerModule.extend( {
	player: null,

	isYTVideo: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				backgroundVideoContainer: '.elementor-background-video-container',
				backgroundVideoEmbed: '.elementor-background-video-embed',
				backgroundVideoHosted: '.elementor-background-video-hosted'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			elements = {
				$backgroundVideoContainer: this.$element.find( selectors.backgroundVideoContainer )
			};

		elements.$backgroundVideoEmbed = elements.$backgroundVideoContainer.children( selectors.backgroundVideoEmbed );

		elements.$backgroundVideoHosted = elements.$backgroundVideoContainer.children( selectors.backgroundVideoHosted );

		return elements;
	},

	calcVideosSize: function() {
		var containerWidth = this.elements.$backgroundVideoContainer.outerWidth(),
			containerHeight = this.elements.$backgroundVideoContainer.outerHeight(),
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
	},

	changeVideoSize: function() {
		var $video = this.isYTVideo ? jQuery( this.player.getIframe() ) : this.elements.$backgroundVideoHosted,
			size = this.calcVideosSize();

		$video.width( size.width ).height( size.height );
	},

	startVideoLoop: function() {
		var self = this;

		// If the section has been removed
		if ( ! self.player.getIframe().contentWindow ) {
			return;
		}

		var elementSettings = self.getElementSettings(),
			startPoint = elementSettings.background_video_start || 0,
			endPoint = elementSettings.background_video_end;

		self.player.seekTo( startPoint );

		if ( endPoint ) {
			var durationToEnd = endPoint - startPoint + 1;

			setTimeout( function() {
				self.startVideoLoop();
			}, durationToEnd * 1000 );
		}
	},

	prepareYTVideo: function( YT, videoID ) {
		var self = this,
			$backgroundVideoContainer = self.elements.$backgroundVideoContainer,
			elementSettings = self.getElementSettings(),
			startStateCode = YT.PlayerState.PLAYING;

		// Since version 67, Chrome doesn't fire the `PLAYING` state at start time
		if ( window.chrome ) {
			startStateCode = YT.PlayerState.UNSTARTED;
		}

		$backgroundVideoContainer.addClass( 'elementor-loading elementor-invisible' );

		self.player = new YT.Player( self.elements.$backgroundVideoEmbed[ 0 ], {
			videoId: videoID,
			events: {
				onReady: function() {
					self.player.mute();

					self.changeVideoSize();

					self.startVideoLoop();

					self.player.playVideo();
				},
				onStateChange: function( event ) {
					switch ( event.data ) {
						case startStateCode:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							self.player.seekTo( elementSettings.background_video_start || 0 );
					}
				}
			},
			playerVars: {
				controls: 0,
				showinfo: 0,
				rel: 0
			}
		} );

		elementorFrontend.getElements( '$window' ).on( 'resize', self.changeVideoSize );
	},

	activate: function() {
		var self = this,
			videoLink = self.getElementSettings( 'background_video_link' ),
			videoID = elementorFrontend.utils.youtube.getYoutubeIDFromURL( videoLink );

		self.isYTVideo = !! videoID;

		if ( videoID ) {
			elementorFrontend.utils.youtube.onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					self.prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			self.elements.$backgroundVideoHosted.attr( 'src', videoLink ).one( 'canplay', self.changeVideoSize );
		}
	},

	deactivate: function() {
		if ( this.isYTVideo && this.player.getIframe() ) {
			this.player.destroy();
		} else {
			this.elements.$backgroundVideoHosted.removeAttr( 'src' );
		}
	},

	run: function() {
		var elementSettings = this.getElementSettings();

		if ( 'video' === elementSettings.background_background && elementSettings.background_video_link ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.run();
	},

	onElementChange: function( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
} );

var StretchedSection = HandlerModule.extend( {

	stretchElement: null,

	bindEvents: function() {
		var handlerID = this.getUniqueHandlerID();

		elementorFrontend.addListenerOnce( handlerID, 'resize', this.stretch );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:stick', this.stretch, this.$element );

		elementorFrontend.addListenerOnce( handlerID, 'sticky:unstick', this.stretch, this.$element );
	},

	unbindEvents: function() {
		elementorFrontend.removeListeners( this.getUniqueHandlerID(), 'resize', this.stretch );
	},

	initStretch: function() {
		this.stretchElement = new elementorFrontend.modules.StretchElement( {
			element: this.$element,
			selectors: {
				container: this.getStretchContainer()
			}
		} );
	},

	getStretchContainer: function() {
		return elementorFrontend.getGeneralSettings( 'elementor_stretched_section_container' ) || window;
	},

	stretch: function() {
		if ( ! this.getElementSettings( 'stretch_section' ) ) {
			return;
		}

		this.stretchElement.stretch();
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.initStretch();

		var isStretched = this.getElementSettings( 'stretch_section' );

		if ( elementorFrontend.isEditMode() || isStretched ) {
			this.stretchElement.reset();
		}

		this.stretch();
	},

	onElementChange: function( propertyName ) {
		if ( 'stretch_section' === propertyName ) {
			if ( this.getElementSettings( 'stretch_section' ) ) {
				this.stretch();
			} else {
				this.stretchElement.reset();
			}
		}
	},

	onGeneralSettingsChange: function( changed ) {
		if ( 'elementor_stretched_section_container' in changed ) {
			this.stretchElement.setSettings( 'selectors.container', this.getStretchContainer() );

			this.stretch();
		}
	}
} );

var Shapes = HandlerModule.extend( {

	getDefaultSettings: function() {
		return {
			selectors: {
				container: '> .elementor-shape-%s'
			},
			svgURL: elementorFrontend.config.urls.assets + 'shapes/'
		};
	},

	getDefaultElements: function() {
		var elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$topContainer = this.$element.find( selectors.container.replace( '%s', 'top' ) );

		elements.$bottomContainer = this.$element.find( selectors.container.replace( '%s', 'bottom' ) );

		return elements;
	},

	buildSVG: function( side ) {
		var self = this,
			baseSettingKey = 'shape_divider_' + side,
			shapeType = self.getElementSettings( baseSettingKey ),
			$svgContainer = this.elements[ '$' + side + 'Container' ];

		$svgContainer.empty().attr( 'data-shape', shapeType );

		if ( ! shapeType ) {
			return;
		}

		var fileName = shapeType;

		if ( self.getElementSettings( baseSettingKey + '_negative' ) ) {
			fileName += '-negative';
		}

		var svgURL = self.getSettings( 'svgURL' ) + fileName + '.svg';

		jQuery.get( svgURL, function( data ) {
			$svgContainer.append( data.childNodes[0] );
		} );

		this.setNegative( side );
	},

	setNegative: function( side ) {
		this.elements[ '$' + side + 'Container' ].attr( 'data-negative', !! this.getElementSettings( 'shape_divider_' + side + '_negative' ) );
	},

	onInit: function() {
		var self = this;

		HandlerModule.prototype.onInit.apply( self, arguments );

		[ 'top', 'bottom' ].forEach( function( side ) {
			if ( self.getElementSettings( 'shape_divider_' + side ) ) {
				self.buildSVG( side );
			}
		} );
	},

	onElementChange: function( propertyName ) {
		var shapeChange = propertyName.match( /^shape_divider_(top|bottom)$/ );

		if ( shapeChange ) {
			this.buildSVG( shapeChange[1] );

			return;
		}

		var negativeChange = propertyName.match( /^shape_divider_(top|bottom)_negative$/ );

		if ( negativeChange ) {
			this.buildSVG( negativeChange[1] );

			this.setNegative( negativeChange[1] );
		}
	}
} );

module.exports = function( $scope ) {
	if ( elementorFrontend.isEditMode() || $scope.hasClass( 'elementor-section-stretched' ) ) {
		new StretchedSection( { $element: $scope } );
	}

	if ( elementorFrontend.isEditMode() ) {
		new Shapes( { $element: $scope } );
	}

	new BackgroundVideo( { $element: $scope } );
};
