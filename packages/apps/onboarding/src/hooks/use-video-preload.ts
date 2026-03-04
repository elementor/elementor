import { useEffect } from 'react';

import { getVideoUrls } from '../steps/step-visuals';

export function useVideoPreload() {
	useEffect( () => {
		getVideoUrls().forEach( ( url ) => {
			const link = document.createElement( 'link' );
			link.rel = 'preload';
			link.as = 'video';
			link.href = url;
			document.head.appendChild( link );
		} );
	}, [] );
}
