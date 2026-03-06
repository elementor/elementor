import { useEffect } from 'react';

import { getVideoUrls } from '../steps/step-visuals';

const preloadedUrls = new Set< string >();

export function isVideoPreloaded( url: string ): boolean {
	return preloadedUrls.has( url );
}

export function useVideoPreload() {
	useEffect( () => {
		getVideoUrls().forEach( ( url ) => {
			const link = document.createElement( 'link' );
			link.rel = 'preload';
			link.as = 'video';
			link.href = url;
			document.head.appendChild( link );

			const video = document.createElement( 'video' );
			video.preload = 'auto';
			video.src = url;
			video.addEventListener(
				'canplaythrough',
				() => {
					preloadedUrls.add( url );
				},
				{ once: true }
			);
			video.addEventListener( 'error', () => {}, { once: true } );
		} );
	}, [] );
}
