import { register } from '@elementor/frontend-handlers';

const getYoutubeVideoIdFromUrl = ( url ) => {
	const regex = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user|shorts)\/))([^?&"'>]+)/;
	const match = url.match( regex );
	return match ? match[ 1 ] : null;
};

const loadYouTubeAPI = () => {
	return new Promise( ( resolve ) => {
		if ( window.YT && window.YT.loaded ) {
			resolve( window.YT );
			return;
		}

		const YOUTUBE_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
		if ( ! document.querySelector( `script[src="${ YOUTUBE_IFRAME_API_URL }"]` ) ) {
			const tag = document.createElement( 'script' );
			tag.src = YOUTUBE_IFRAME_API_URL;
			const firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];
			firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );
		}

		const checkYT = () => {
			if ( window.YT && window.YT.loaded ) {
				resolve( window.YT );
			} else {
				setTimeout( checkYT, 350 );
			}
		};
		checkYT();
	} );
};

register( {
	elementType: 'e-youtube',
	uniqueId: 'e-youtube-handler',
	callback: ( { element } ) => {
		const youtubeElement = document.createElement( 'div' );
		youtubeElement.style.height = '100%';
		element.appendChild( youtubeElement );

		const settingsAttr = element.getAttribute( 'data-settings' );
		const parsedSettings = settingsAttr ? JSON.parse( settingsAttr ) : {};

		const videoId = getYoutubeVideoIdFromUrl( parsedSettings.source );

		if ( ! videoId ) {
			return;
		}

		let player;
		let observer;

		const prepareYTVideo = ( YT ) => {
			const playerOptions = {
				videoId,
				events: {
					onReady: () => {
						if ( parsedSettings.mute ) {
							player.mute();
						}

						if ( parsedSettings.autoplay ) {
							player.playVideo();
						}
					},
					onStateChange: ( event ) => {
						if ( event.data === YT.PlayerState.ENDED && parsedSettings.loop ) {
							player.seekTo( parsedSettings.start || 0 );
						}
					},
				},
				playerVars: {
					controls: parsedSettings.controls ? 1 : 0,
					rel: parsedSettings.rel ? 0 : 1,
					cc_load_policy: parsedSettings.cc_load_policy ? 1 : 0,
					autoplay: parsedSettings.autoplay ? 1 : 0,
					start: parsedSettings.start,
					end: parsedSettings.end,
				},
			};

			// To handle CORS issues, when the default host is changed, the origin parameter has to be set.
			if ( parsedSettings.privacy ) {
				playerOptions.host = 'https://www.youtube-nocookie.com';
				playerOptions.origin = window.location.hostname;
			}

			player = new YT.Player( youtubeElement, playerOptions );

			return player;
		};

		if ( parsedSettings.lazyload ) {
			observer = new IntersectionObserver(
				( entries ) => {
					if ( entries[ 0 ].isIntersecting ) {
						loadYouTubeAPI().then( ( apiObject ) => prepareYTVideo( apiObject ) );
						observer.unobserve( element );
					}
				},
			);

			observer.observe( element );
		} else {
			loadYouTubeAPI().then( ( apiObject ) => prepareYTVideo( apiObject ) );
		}

		return () => {
			if ( player && 'function' === typeof player.destroy ) {
				player.destroy();
				player = null;
			}

			if ( element.contains( youtubeElement ) ) {
				element.removeChild( youtubeElement );
			}

			if ( observer && 'function' === typeof observer.disconnect ) {
				observer.disconnect();
				observer = null;
			}
		};
	},
} );
