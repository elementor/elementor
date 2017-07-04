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

	prepareYTVideo: function( YT, videoID ) {
		var self = this,
			$backgroundVideoContainer = self.elements.$backgroundVideoContainer;

		$backgroundVideoContainer.addClass( 'elementor-loading elementor-invisible' );

		self.player = new YT.Player( self.elements.$backgroundVideoEmbed[ 0 ], {
			videoId: videoID,
			events: {
				onReady: function() {
					self.player.mute();

					self.changeVideoSize();

					self.player.playVideo();
				},
				onStateChange: function( event ) {
					switch ( event.data ) {
						case YT.PlayerState.PLAYING:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							self.player.seekTo( 0 );
					}
				}
			},
			playerVars: {
				controls: 0,
				showinfo: 0
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

	bindEvents: function() {
		elementorFrontend.addListenerOnce( this.$element.data( 'model-cid' ), 'resize', this.stretchSection );
	},

	stretchSection: function() {
		// Clear any previously existing css associated with this script
		var direction = elementorFrontend.config.is_rtl ? 'right' : 'left',
			resetCss = {},
			isStretched = this.$element.hasClass( 'elementor-section-stretched' );

		if ( elementorFrontend.isEditMode() || isStretched ) {
			resetCss.width = 'auto';

			resetCss[ direction ] = 0;

			this.$element.css( resetCss );
		}

		if ( ! isStretched ) {
			return;
		}

		var $sectionContainer,
			hasSpecialContainer = false;

		try {
			$sectionContainer = jQuery( elementorFrontend.getGeneralSettings( 'elementor_stretched_section_container' ) );

			if ( $sectionContainer.length ) {
				hasSpecialContainer = true;
			}
		} catch ( e ) {}

		if ( ! hasSpecialContainer ) {
			$sectionContainer = elementorFrontend.getElements( '$window' );
		}

		var containerWidth = $sectionContainer.outerWidth(),
			sectionWidth = this.$element.outerWidth(),
			sectionOffset = this.$element.offset().left,
			correctOffset = sectionOffset;

		if ( hasSpecialContainer ) {
			var containerOffset = $sectionContainer.offset().left;

			if ( sectionOffset > containerOffset ) {
				correctOffset = sectionOffset - containerOffset;
			} else {
				correctOffset = 0;
			}
		}

		if ( elementorFrontend.config.is_rtl ) {
			correctOffset = containerWidth - ( sectionWidth + correctOffset );
		}

		resetCss.width = containerWidth + 'px';

		resetCss[ direction ] = -correctOffset + 'px';

		this.$element.css( resetCss );
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.stretchSection();
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
	new StretchedSection( { $element: $scope } );

	if ( elementorFrontend.isEditMode() ) {
		new Shapes( { $element:  $scope } );
	}

	new BackgroundVideo( { $element: $scope } );
};
