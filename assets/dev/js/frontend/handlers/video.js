class VideoModule extends elementorModules.frontend.handlers.Base {
	getDefaultSettings() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				videoContainer: '.elementor-video-container',
				video: '.elementor-video',
				videoIframe: '.elementor-video-iframe',
			},
		};
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$videoContainer: this.$element.find( selectors.videoContainer ),
			$video: this.$element.find( selectors.video ),
			$videoIframe: this.$element.find( selectors.videoIframe ),
		};
	}

	getLightBox() {
		return elementorFrontend.utils.lightbox;
	}

	handleVideo() {
		if ( ! this.getElementSettings( 'lightbox' ) ) {
			this.elements.$imageOverlay.remove();

			// Currently, this.videoID only exists when the video is a YouTube video
			if ( this.videoID ) {
				this.apiProvider.onApiReady( ( apiObject ) => {
					this.prepareYTVideo( apiObject );
				} );

				return;
			}

			this.playVideo();
		}
	}

	playVideo() {
		if ( this.elements.$video.length ) {
			this.elements.$video[ 0 ].play();

			return;
		}

		const $videoIframe = this.elements.$videoIframe,
			lazyLoad = $videoIframe.data( 'lazy-load' );

		if ( lazyLoad ) {
			$videoIframe.attr( 'src', lazyLoad );
		}

		const newSourceUrl = $videoIframe[ 0 ].src.replace( '&autoplay=0', '' );

		$videoIframe[ 0 ].src = newSourceUrl + '&autoplay=1';

		if ( $videoIframe[ 0 ].src.includes( 'vimeo.com' ) ) {
			const videoSrc = $videoIframe[ 0 ].src,
				timeMatch = /#t=[^&]*/.exec( videoSrc );

			// Param '#t=' must be last in the URL
			$videoIframe[ 0 ].src = videoSrc.slice( 0, timeMatch.index ) + videoSrc.slice( timeMatch.index + timeMatch[ 0 ].length ) + timeMatch[ 0 ];
		}
	}

	animateVideo() {
		this.getLightBox().setEntranceAnimation( this.getCurrentDeviceSetting( 'lightbox_content_animation' ) );
	}

	handleAspectRatio() {
		this.getLightBox().setVideoAspectRatio( this.getElementSettings( 'aspect_ratio' ) );
	}

	startVideoLoop( firstTime ) {
		// If the section has been removed
		if ( ! this.player.getIframe().contentWindow ) {
			return;
		}

		const elementSettings = this.getElementSettings(),
			startPoint = elementSettings.start || 0,
			endPoint = elementSettings.end;

		if ( ! elementSettings.loop && ! firstTime ) {
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

	prepareYTVideo( YT ) {
		const elementSettings = this.getElementSettings(),
			playerOptions = {
				videoId: this.videoID,
				events: {
					onReady: () => {
						if ( elementSettings.mute ) {
							this.player.mute();
						}

						this.startVideoLoop( true );

						this.player.playVideo();
					},
					onStateChange: ( event ) => {
						if ( event.data === YT.PlayerState.ENDED && elementSettings.loop ) {
							this.player.seekTo( elementSettings.start || 0 );
						}
					},
				},
				playerVars: {
					controls: elementSettings.controls ? 1 : 0,
					rel: elementSettings.rel ? 1 : 0,
					playsinline: elementSettings.play_on_mobile ? 1 : 0,
					modestbranding: elementSettings.modestbranding ? 1 : 0,
				},
			};

		if ( elementSettings.yt_privacy ) {
			playerOptions.host = 'https://www.youtube-nocookie.com';
			playerOptions.playerVars.origin = window.location.hostname;
		}

		this.player = new YT.Player( this.elements.$video[ 0 ], playerOptions );
	}

	bindEvents() {
		this.elements.$imageOverlay.on( 'click', this.handleVideo.bind( this ) );
	}

	onInit() {
		super.onInit();

		const elementSettings = this.getElementSettings();

		if ( 'youtube' === elementSettings.video_type ) {
			this.apiProvider = elementorFrontend.utils.youtube;
		} else {
			// Currently the only API integration in the Video widget is for the YT API
			return;
		}

		this.videoID = this.apiProvider.getVideoIDFromURL( elementSettings.youtube_url );

		// If there is an image overlay, the YouTube video prep method will be triggered on click
		if ( ! this.videoID || elementSettings.show_image_overlay ) {
			return;
		}

		this.apiProvider.onApiReady( ( apiObject ) => {
			this.prepareYTVideo( apiObject );
		} );
	}

	onElementChange( propertyName ) {
		if ( 0 === propertyName.indexOf( 'lightbox_content_animation' ) ) {
			this.animateVideo();

			return;
		}

		const isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			this.getLightBox().getModal().hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();
		}
	}
}

export default ( $scope ) => {
	elementorFrontend.elementsHandler.addHandler( VideoModule, { $element: $scope } );
};
