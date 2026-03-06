import { useEffect } from 'react';

import { getVideoUrls } from '../steps/step-visuals';

const preloadedUrls = new Set< string >();

export function useVideoPreload() {
	useEffect( () => {
		let isMounted = true;

		const preloadSequentially = async () => {
			for ( const url of getVideoUrls() ) {
				if ( ! isMounted ) {
					break;
				}

				if ( preloadedUrls.has( url ) ) {
					continue;
				}

				await waitForVideo( url );
			}
		};

		preloadSequentially();

		return () => {
			isMounted = false;
		};
	}, [] );
}

export function isVideoPreloaded( url: string ): boolean {
	return preloadedUrls.has( url );
}

const waitForVideo = ( url: string ): Promise< void > =>
	new Promise( ( resolve ) => {
		const video = document.createElement( 'video' );

		const cleanup = () => {
			video.removeEventListener( 'canplaythrough', onCanPlayThrough );
			video.removeEventListener( 'error', onError );
			video.src = '';
			video.load();
		};

		const onCanPlayThrough = () => {
			preloadedUrls.add( url );
			cleanup();
			resolve();
		};

		const onError = () => {
			cleanup();
			resolve();
		};

		video.addEventListener( 'canplaythrough', onCanPlayThrough );
		video.addEventListener( 'error', onError );
		video.preload = 'auto';
		video.src = url;
		video.load();
	} );
