export default class BackgroundVideo extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				backgroundVideoContainer: '.elementor-background-video-container',
				backgroundVideoEmbed: '.elementor-background-video-embed',
				backgroundVideoHosted: '.elementor-background-video-hosted',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			elements = {
				$backgroundVideoContainer: this.$element.find( selectors.backgroundVideoContainer ),
			};

		elements.$backgroundVideoEmbed = elements.$backgroundVideoContainer.children( selectors.backgroundVideoEmbed );

		elements.$backgroundVideoHosted = elements.$backgroundVideoContainer.children( selectors.backgroundVideoHosted );

		return elements;
	}

	calcVideosSize() {
		const containerWidth = this.elements.$backgroundVideoContainer.outerWidth(),
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
	}

	changeVideoSize() {
		const $video = this.isYTVideo ? jQuery( this.player.getIframe() ) : this.elements.$backgroundVideoHosted,
			size = this.calcVideosSize();

		$video.width( size.width ).height( size.height );
	}

	startVideoLoop( firstTime ) {
		// If the section has been removed
		if ( ! this.player.getIframe().contentWindow ) {
			return;
		}

		const elementSettings = this.getElementSettings(),
			startPoint = elementSettings.background_video_start || 0,
			endPoint = elementSettings.background_video_end;

		if ( elementSettings.background_play_once && ! firstTime ) {
			this.player.stopVideo();
			return;
		}

		this.player.seekTo( startPoint );

		if ( endPoint ) {
			const durationToEnd = endPoint - startPoint + 1;

			setTimeout( () => {
				this.startVideoLoop( false );
			}, durationToEnd * 1000 );
		}
	}

	prepareYTVideo( YT, videoID ) {
		const $backgroundVideoContainer = this.elements.$backgroundVideoContainer,
			elementSettings = this.getElementSettings();
		let startStateCode = YT.PlayerState.PLAYING;

		// Since version 67, Chrome doesn't fire the `PLAYING` state at start time
		if ( window.chrome ) {
			startStateCode = YT.PlayerState.UNSTARTED;
		}

		$backgroundVideoContainer.addClass( 'elementor-loading elementor-invisible' );

		this.player = new YT.Player( this.elements.$backgroundVideoEmbed[ 0 ], {
			videoId: videoID,
			events: {
				onReady: () => {
					this.player.mute();

					this.changeVideoSize();

					this.startVideoLoop( true );

					this.player.playVideo();
				},
				onStateChange: ( event ) => {
					switch ( event.data ) {
						case startStateCode:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							this.player.seekTo( elementSettings.background_video_start || 0 );
							if ( elementSettings.background_play_once ) {
								this.player.destroy();
							}
					}
				},
			},
			playerVars: {
				controls: 0,
				rel: 0,
			},
		} );
	}

	activate() {
		let videoLink = this.getElementSettings( 'background_video_link' );
		const videoID = elementorFrontend.utils.youtube.getYoutubeIDFromURL( videoLink ),
			playOnce = this.getElementSettings( 'background_play_once' );

		this.isYTVideo = ! ! videoID;

		if ( videoID ) {
			elementorFrontend.utils.youtube.onYoutubeApiReady( ( YT ) => {
				setTimeout( () => {
					this.prepareYTVideo( YT, videoID );
				}, 0 );
			} );
		} else {
			const startTime = this.getElementSettings( 'background_video_start' ),
				endTime = this.getElementSettings( 'background_video_end' );
			if ( startTime || endTime ) {
				videoLink += '#t=' + ( startTime || 0 ) + ( endTime ? ',' + endTime : '' );
			}
			this.elements.$backgroundVideoHosted.attr( 'src', videoLink ).one( 'canplay', this.changeVideoSize.bind( this ) );
			if ( playOnce ) {
				this.elements.$backgroundVideoHosted.on( 'ended', () => {
					this.elements.$backgroundVideoHosted.hide();
				} );
			}
		}

		elementorFrontend.elements.$window.on( 'resize', this.changeVideoSize );
	}

	deactivate() {
		if ( this.isYTVideo && this.player.getIframe() ) {
			this.player.destroy();
		} else {
			this.elements.$backgroundVideoHosted.removeAttr( 'src' ).off( 'ended' );
		}

		elementorFrontend.elements.$window.off( 'resize', this.changeVideoSize );
	}

	run() {
		const elementSettings = this.getElementSettings();

		if ( ! elementSettings.background_play_on_mobile && 'mobile' === elementorFrontend.getCurrentDeviceMode() ) {
			return;
		}

		if ( 'video' === elementSettings.background_background && elementSettings.background_video_link ) {
			this.activate();
		} else {
			this.deactivate();
		}
	}

	onInit( ...args ) {
		super.onInit( ...args );

		this.changeVideoSize = this.changeVideoSize.bind( this );

		this.run();
	}

	onElementChange( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
}
