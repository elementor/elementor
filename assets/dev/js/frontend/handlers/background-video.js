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
				backgroundVideoContainer: this.baseElement?.querySelector( selectors.backgroundVideoContainer ),
			};

		elements.backgroundVideoEmbed = elements.backgroundVideoContainer?.querySelector( selectors.backgroundVideoEmbed );

		elements.backgroundVideoHosted = elements.backgroundVideoContainer?.querySelector( selectors.backgroundVideoHosted );

		return elements;
	}

	calcVideosSize( videoElement ) {
		let aspectRatioSetting = '16:9';

		if ( 'vimeo' === this.videoType ) {
			aspectRatioSetting = videoElement.width + ':' + videoElement.height;
		}

		const containerWidth = this.elements.backgroundVideoContainer.offsetWidth,
			containerHeight = this.elements.backgroundVideoContainer.offsetHeight,
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
		if ( ! ( 'hosted' === this.videoType ) && ! this.player ) {
			return;
		}

		let videoElement;

		if ( 'youtube' === this.videoType ) {
			videoElement = this.player.getIframe();
		} else if ( 'vimeo' === this.videoType ) {
			videoElement = this.player.element;
		} else if ( 'hosted' === this.videoType ) {
			videoElement = this.elements.backgroundVideoHosted;
		}

		if ( ! videoElement ) {
			return;
		}

		const size = this.calcVideosSize( videoElement );

		videoElement.style.width = size.width + 'px';
		videoElement.style.height = size.height + 'px';
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

	prepareVimeoVideo( Vimeo, videoLink ) {
		const elementSettings = this.getElementSettings(),
			videoSize = this.elements.backgroundVideoContainer.offsetWidth,
			vimeoOptions = {
				url: videoLink,
				width: videoSize.width,
				autoplay: true,
				loop: ! elementSettings.background_play_once,
				transparent: true,
				background: true,
				muted: true,
			};

		if ( elementSettings.background_privacy_mode ) {
			vimeoOptions.dnt = true;
		}

		this.player = new Vimeo.Player( this.elements.backgroundVideoContainer, vimeoOptions );

		// Handle user-defined start/end times
		this.handleVimeoStartEndTimes( elementSettings );

		this.player.ready().then( () => {
			this.player.element.classList.add( 'elementor-background-video-embed' );
			this.changeVideoSize();
		} );
	}

	handleVimeoStartEndTimes( elementSettings ) {
		// If a start time is defined, set the start time
		if ( elementSettings.background_video_start ) {
			this.player.on( 'play', ( data ) => {
				if ( 0 === data.seconds ) {
					this.player.setCurrentTime( elementSettings.background_video_start );
				}
			} );
		}

		this.player.on( 'timeupdate', ( data ) => {
			// If an end time is defined, handle ending the video
			if ( elementSettings.background_video_end && elementSettings.background_video_end < data.seconds ) {
				if ( elementSettings.background_play_once ) {
					// Stop at user-defined end time if not loop
					this.player.pause();
				} else {
					// Go to start time if loop
					this.player.setCurrentTime( elementSettings.background_video_start );
				}
			}

			// If start time is defined but an end time is not, go to user-defined start time at video end.
			// Vimeo JS API has an 'ended' event, but it never fires when infinite loop is defined, so we
			// get the video duration (returns a promise) then use duration-0.5s as end time
			this.player.getDuration().then( ( duration ) => {
				if ( elementSettings.background_video_start && ! elementSettings.background_video_end && data.seconds > duration - 0.5 ) {
					this.player.setCurrentTime( elementSettings.background_video_start );
				}
			} );
		} );
	}

	prepareYTVideo( YT, videoID ) {
		const backgroundVideoContainer = this.elements.backgroundVideoContainer,
			elementSettings = this.getElementSettings();
		let startStateCode = YT.PlayerState.PLAYING;

		// Since version 67, Chrome doesn't fire the `PLAYING` state at start time
		if ( window.chrome ) {
			startStateCode = YT.PlayerState.UNSTARTED;
		}

		const playerOptions = {
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
							backgroundVideoContainer.classList.remove( 'elementor-invisible' );
							backgroundVideoContainer.classList.remove( 'elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							if ( 'function' === typeof this.player.seekTo ) {
								this.player.seekTo( elementSettings.background_video_start || 0 );
							}
							if ( elementSettings.background_play_once ) {
								this.player.destroy();
							}
					}
				},
			},
			playerVars: {
				controls: 0,
				rel: 0,
				playsinline: 1,
			},
		};

		// To handle CORS issues, when the default host is changed, the origin parameter has to be set.
		if ( elementSettings.background_privacy_mode ) {
			playerOptions.host = 'https://www.youtube-nocookie.com';
			playerOptions.origin = window.location.hostname;
		}

		backgroundVideoContainer.classList.add( 'elementor-loading' )
		backgroundVideoContainer.classList.add( 'elementor-invisible' )

		this.player = new YT.Player( this.elements.backgroundVideoEmbed, playerOptions );
	}

	activate() {
		let videoLink = this.getElementSettings( 'background_video_link' ),
			videoID;

		const playOnce = this.getElementSettings( 'background_play_once' );

		if ( -1 !== videoLink.indexOf( 'vimeo.com' ) ) {
			this.videoType = 'vimeo';
			this.apiProvider = elementorFrontend.utils.vimeo;
		} else if ( videoLink.match( /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com)/ ) ) {
			this.videoType = 'youtube';
			this.apiProvider = elementorFrontend.utils.youtube;
		}

		if ( this.apiProvider ) {
			videoID = this.apiProvider.getVideoIDFromURL( videoLink );

			this.apiProvider.onApiReady( ( apiObject ) => {
				if ( 'youtube' === this.videoType ) {
					this.prepareYTVideo( apiObject, videoID );
				}

				if ( 'vimeo' === this.videoType ) {
					this.prepareVimeoVideo( apiObject, videoLink );
				}
			} );
		} else {
			this.videoType = 'hosted';

			const startTime = this.getElementSettings( 'background_video_start' ),
				endTime = this.getElementSettings( 'background_video_end' );
			if ( startTime || endTime ) {
				videoLink += '#t=' + ( startTime || 0 ) + ( endTime ? ',' + endTime : '' );
			}
			this.elements.backgroundVideoHosted?.setAttribute( 'src', videoLink ).addEventListener( 'canplay', this.changeVideoSize.bind( this ), { once: true } );
			if ( playOnce ) {
				this.elements.backgroundVideoHosted.addEventListener( 'ended', () => {
					this.elements.backgroundVideoHosted.hide();
				} );
			}
		}

		elementorFrontend.elements.window.addEventListener( 'resize', this.changeVideoSize );
		elementorFrontend.elements.window.addEventListener( 'elementor/bg-video/recalc', this.changeVideoSize );

	}

	deactivate() {
		if ( ( 'youtube' === this.videoType && this.player.getIframe() ) || 'vimeo' === this.videoType ) {
			this.player.destroy();
		} else {
			this.elements.backgroundVideoHosted?.removeAttribute( 'src' ).removeEventListener( 'ended' );
		}

		elementorFrontend.elements.window.removeEventListener( 'resize', this.changeVideoSize );
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
		this.isJqueryRequired = false;

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
