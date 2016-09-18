module.exports = function( $ ) {

	/*
	 * Force section full-width for non full-width templates
	 */
	// Clear any previously existing css associated with this script
	this.removeAttr( 'style' );

	if ( this.hasClass( 'elementor-section-stretched' ) ) {
		var $section = this,
			scopeWindow = elementorFrontend.getScopeWindow(),
			$scopeWindow = $( scopeWindow ),
			sectionContainerSelector = elementorFrontend.config.stretchedSectionContainer, // User-defined parent container selector
			$sectionContainer = $( scopeWindow.document ).find( sectionContainerSelector ),
			$offsetParent = $section.offsetParent();
			if ( $section.offsetParent().is( 'html' ) ) {
				$offsetParent = $section.parent();
			}

		var stretchSection = function() {
			var sectionWidth = $scopeWindow.width(),
				parentPadding = parseInt( $offsetParent.css( 'padding-left' ).replace( 'px', '' ), 10 ),
				parentOffset = $offsetParent.offset().left +  parentPadding,
				sectionOffset = '-' + parentOffset;

			if ( 0 < $sectionContainer.length ) {
				var containerOffset = $sectionContainer.offset().left;
				sectionWidth = $sectionContainer.width();
				sectionOffset = containerOffset;
				if ( $offsetParent && ( parentOffset >= containerOffset ) ) {
					sectionOffset = '-' + ( parentOffset - containerOffset );
				}
			}
			$section.css( {
				'width': sectionWidth,
				'left': sectionOffset + 'px'
			} );
		};

		$scopeWindow.on( 'resize', function() {
			stretchSection();
		} );

		stretchSection();
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
