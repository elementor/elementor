const BackgroundVideo = elementorModules.frontend.handlers.Base.extend( {
	player: null,

	isYTVideo: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				backgroundVideoContainer: '.elementor-background-video-container',
				backgroundVideoEmbed: '.elementor-background-video-embed',
				backgroundVideoHosted: '.elementor-background-video-hosted',
			},
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			elements = {
				$backgroundVideoContainer: this.$element.find( selectors.backgroundVideoContainer ),
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
			height: isWidthFixed ? ratioWidth : containerHeight,
		};
	},

	changeVideoSize: function() {
		var $video = this.isYTVideo ? jQuery( this.player.getIframe() ) : this.elements.$backgroundVideoHosted,
			size = this.calcVideosSize();

		$video.width( size.width ).height( size.height );
	},

	startVideoLoop: function( firstTime ) {
		const self = this;

		// If the section has been removed
		if ( ! self.player.getIframe().contentWindow ) {
			return;
		}

		const elementSettings = self.getElementSettings(),
			startPoint = elementSettings.background_video_start || 0,
			endPoint = elementSettings.background_video_end;

		if ( elementSettings.background_play_once && ! firstTime ) {
			self.player.stopVideo();
			return;
		}

		self.player.seekTo( startPoint );

		if ( endPoint ) {
			const durationToEnd = endPoint - startPoint + 1;

			setTimeout( function() {
				self.startVideoLoop( false );
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

					self.startVideoLoop( true );

					self.player.playVideo();
				},
				onStateChange: function( event ) {
					switch ( event.data ) {
						case startStateCode:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							self.player.seekTo( elementSettings.background_video_start || 0 );
							if ( elementSettings.background_play_once ) {
								self.player.destroy();
							}
					}
				},
			},
			playerVars: {
				controls: 0,
				rel: 0,
			},
		} );
	},

	activate: function() {
		var self = this,
			videoLink = self.getElementSettings( 'background_video_link' ),
			videoID = elementorFrontend.utils.youtube.getYoutubeIDFromURL( videoLink ),
			playOnce = self.getElementSettings( 'background_play_once' );

		self.isYTVideo = ! ! videoID;

		if ( videoID ) {
			elementorFrontend.utils.youtube.onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					self.prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			const startTime = self.getElementSettings( 'background_video_start' ),
				endTime = self.getElementSettings( 'background_video_end' );
			if ( startTime || endTime ) {
				videoLink += '#t=' + ( startTime || 0 ) + ( endTime ? ',' + endTime : '' );
			}
			self.elements.$backgroundVideoHosted.attr( 'src', videoLink ).one( 'canplay', self.changeVideoSize );
			if ( playOnce ) {
				self.elements.$backgroundVideoHosted.on( 'ended', function() {
					self.elements.$backgroundVideoHosted.hide();
				} );
			}
		}

		elementorFrontend.elements.$window.on( 'resize', self.changeVideoSize );
	},

	deactivate: function() {
		if ( this.isYTVideo && this.player.getIframe() ) {
			this.player.destroy();
		} else {
			this.elements.$backgroundVideoHosted.removeAttr( 'src' ).off( 'ended' );
		}

		elementorFrontend.elements.$window.off( 'resize', this.changeVideoSize );
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
		elementorModules.frontend.handlers.Base.prototype.onInit.apply( this, arguments );

		this.run();
	},

	onElementChange: function( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	},
} );

var StretchedSection = elementorModules.frontend.handlers.Base.extend( {

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
		this.stretchElement = new elementorModules.frontend.tools.StretchElement( {
			element: this.$element,
			selectors: {
				container: this.getStretchContainer(),
			},
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
		elementorModules.frontend.handlers.Base.prototype.onInit.apply( this, arguments );

		this.initStretch();

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
	},
} );

var Shapes = elementorModules.frontend.handlers.Base.extend( {

	getDefaultSettings: function() {
		return {
			selectors: {
				container: '> .elementor-shape-%s',
			},
			svgURL: elementorFrontend.config.urls.assets + 'shapes/',
		};
	},

	getDefaultElements: function() {
		var elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$topContainer = this.$element.find( selectors.container.replace( '%s', 'top' ) );

		elements.$bottomContainer = this.$element.find( selectors.container.replace( '%s', 'bottom' ) );

		return elements;
	},

	getSvgURL( shapeType, fileName ) {
		let svgURL = this.getSettings( 'svgURL' ) + fileName + '.svg';
		if ( elementor.config.additional_shapes && shapeType in elementor.config.additional_shapes ) {
			svgURL = elementor.config.additional_shapes[ shapeType ];
		}
		return svgURL;
	},

	buildSVG: function( side ) {
		const self = this,
			baseSettingKey = 'shape_divider_' + side,
			shapeType = self.getElementSettings( baseSettingKey ),
			$svgContainer = this.elements[ '$' + side + 'Container' ];

		$svgContainer.attr( 'data-shape', shapeType );

		if ( ! shapeType ) {
			$svgContainer.empty(); // Shape-divider set to 'none'
			return;
		}

		let fileName = shapeType;

		if ( self.getElementSettings( baseSettingKey + '_negative' ) ) {
			fileName += '-negative';
		}

		const svgURL = self.getSvgURL( shapeType, fileName );

		jQuery.get( svgURL, function( data ) {
			$svgContainer.empty().append( data.childNodes[ 0 ] );
		} );

		this.setNegative( side );
	},

	setNegative: function( side ) {
		this.elements[ '$' + side + 'Container' ].attr( 'data-negative', !! this.getElementSettings( 'shape_divider_' + side + '_negative' ) );
	},

	onInit: function() {
		var self = this;

		elementorModules.frontend.handlers.Base.prototype.onInit.apply( self, arguments );

		[ 'top', 'bottom' ].forEach( function( side ) {
			if ( self.getElementSettings( 'shape_divider_' + side ) ) {
				self.buildSVG( side );
			}
		} );
	},

	onElementChange: function( propertyName ) {
		var shapeChange = propertyName.match( /^shape_divider_(top|bottom)$/ );

		if ( shapeChange ) {
			this.buildSVG( shapeChange[ 1 ] );

			return;
		}

		var negativeChange = propertyName.match( /^shape_divider_(top|bottom)_negative$/ );

		if ( negativeChange ) {
			this.buildSVG( negativeChange[ 1 ] );

			this.setNegative( negativeChange[ 1 ] );
		}
	},
} );

var HandlesPosition = elementorModules.frontend.handlers.Base.extend( {

    isFirstSection: function() {
        return this.$element.is( '.elementor-edit-mode .elementor-top-section:first' );
    },

	isOverflowHidden: function() {
		return 'hidden' === this.$element.css( 'overflow' );
	},

    getOffset: function() {
		if ( 'body' === elementor.config.document.container ) {
			return this.$element.offset().top;
		}

		var $container = jQuery( elementor.config.document.container );
		return this.$element.offset().top - $container.offset().top;
	},

    setHandlesPosition: function() {
        const isOverflowHidden = this.isOverflowHidden();

        if ( ! isOverflowHidden && ! this.isFirstSection() ) {
			return;
        }

        const offset = isOverflowHidden ? 0 : this.getOffset(),
            $handlesElement = this.$element.find( '> .elementor-element-overlay > .elementor-editor-section-settings' ),
            insideHandleClass = 'elementor-section--handles-inside';

		if ( offset < 25 ) {
            this.$element.addClass( insideHandleClass );

            if ( offset < -5 ) {
                $handlesElement.css( 'top', -offset );
            } else {
                $handlesElement.css( 'top', '' );
            }
        } else {
            this.$element.removeClass( insideHandleClass );
        }
    },

    onInit: function() {
        this.setHandlesPosition();

        this.$element.on( 'mouseenter', this.setHandlesPosition );
    },
} );

module.exports = function( $scope ) {
	if ( elementorFrontend.isEditMode() || $scope.hasClass( 'elementor-section-stretched' ) ) {
		elementorFrontend.elementsHandler.addHandler( StretchedSection, { $element: $scope } );
	}

	if ( elementorFrontend.isEditMode() ) {
		elementorFrontend.elementsHandler.addHandler( Shapes, { $element: $scope } );
		elementorFrontend.elementsHandler.addHandler( HandlesPosition, { $element: $scope } );
	}

	elementorFrontend.elementsHandler.addHandler( BackgroundVideo, { $element: $scope } );
};
