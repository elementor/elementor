module.exports = function( $ ) {

	// Force section full-width for non full-width templates

	if ( this.hasClass( 'elementor-force-full-width' ) ) {
		var $section = this,
			scopeWindow = elementorFrontend.getScopeWindow(),
			$scopeWindow = $( scopeWindow ),
			sectionContainerSelector = elementorFrontend.config.stretchedSectionContainer,
			$sectionContainer = $( scopeWindow.document ).find( sectionContainerSelector ),
			existingMarginTop = $section.css( 'margin-top' ),
			existingMarginBottom = $section.css( 'margin-bottom' ),
			$placeHolder = $( '<hr class="elementor-full-width-placeholder">' ),
			$offsetParent = $section.offsetParent();

			if ( $offsetParent.is( 'html' ) ) {
				$offsetParent = null;
			}
			if ( ! $section.prev( 'hr.elementor-full-width-placeholder' ).length ) {
				$section.before( $placeHolder );
			}

		var fixWidth = function() {
			if ( $offsetParent || sectionContainerSelector ) {
				var sectionContainerWidth,
					sectionOffset = '0';

				if ( sectionContainerSelector ) {
					sectionContainerWidth = $sectionContainer.innerWidth();
				} else {
					sectionContainerWidth = scopeWindow.innerWidth;
				}
				$section.css( 'width', sectionContainerWidth + 'px' );

				if ( sectionContainerSelector ) {
					if ( $offsetParent ) {
						console.log( $offsetParent );
						if ( $offsetParent.offset().left >= $sectionContainer.offset().left ) {
							sectionOffset = '-' + ( $offsetParent.offset().left - $sectionContainer.offset().left ) + 'px';
						} else {
							sectionOffset = $sectionContainer.offset().left + 'px';
						}
					} else {
						sectionOffset = $sectionContainer.offset().left + 'px';
					}
				} else {
					sectionOffset = '-' + $offsetParent.offset().left + 'px';
				}

				$section.css( 'left', sectionOffset );

			}
		};

		var fixHeight = function() {
			var sectionHeight = $section.css( 'height' );
			$placeHolder.css( {
				'padding-top': sectionHeight,
				'margin-top': existingMarginTop,
				'margin-bottom': existingMarginBottom
			} );
			$section.css( 'margin-top', 'calc( -' + sectionHeight + ' - ' + existingMarginBottom + ')' );
		};

		$scopeWindow.on( 'resize', function() {
			fixWidth();
			fixHeight();
		} );

		fixWidth();
		fixHeight();

	// When removing the class in edit mode

	} else if ( elementorFrontend.isEditMode() ) {
		this.removeAttr( 'style' );
		this.prev( 'hr.elementor-full-width-placeholder' ).remove();
	}

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
			aspectRatio = aspectRatioArray[ 0 ] / aspectRatioArray[ 1 ],
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

		player = new YT.Player( ui.backgroundVideo[ 0 ], {
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

		$( elementorFrontend.getScopeWindow() ).on( 'resize', changeVideoSize );
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
};
