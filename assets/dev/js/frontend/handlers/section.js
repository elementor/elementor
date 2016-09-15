module.exports = function( $ ) {

	/*
	 * Force section full-width for non full-width templates
	 */
	// Clear any previously existing html/css associated with this script
	this.removeAttr( 'style' );
	this.prev( 'hr.elementor-section-stretched-placeholder' ).remove();

	if ( this.hasClass( 'elementor-section-stretched' ) ) {
		var $section = this,
			scopeWindow = elementorFrontend.getScopeWindow(),
			$scopeWindow = $( scopeWindow ),
			sectionContainerSelector = elementorFrontend.config.stretchedSectionContainer, // User-defined parent container selector
			$sectionContainer = $( scopeWindow.document ).find( sectionContainerSelector ),
			$offsetParent = $section.offsetParent(),
			existingMarginTop = $section.css( 'margin-top' ),
			existingMarginBottom = $section.css( 'margin-bottom' ),
			$placeHolder = $( '<hr class="elementor-section-stretched-placeholder">' ),
			sectionOffset = '0';

		if ( $offsetParent.is( 'html' ) ) {
			$offsetParent = null;
		}

		$section.before( $placeHolder );

		var fixWidth = function() {
			if ( $offsetParent || sectionContainerSelector ) {
				var sectionWidth = scopeWindow.innerWidth,
					parentOffset;
				if ( $offsetParent ) {
					parentOffset = $offsetParent.offset().left;
				}
				sectionOffset = '-' + parentOffset;
				if ( sectionContainerSelector ) {
					var containerOffset = $sectionContainer.offset().left;
					sectionWidth = $sectionContainer.innerWidth();
					sectionOffset = containerOffset;
					if ( $offsetParent && ( parentOffset >= containerOffset ) ) {
						sectionOffset = '-' + ( parentOffset - containerOffset );
					}
				}
				$section.css( {
					'width': sectionWidth + 'px',
					'left': sectionOffset + 'px'
				} );
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
