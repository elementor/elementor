import { useEffect } from 'react';

import { getLottieAnimationUrls } from '../steps/step-visuals';

export function useLottiePreload() {
	useEffect( () => {
		getLottieAnimationUrls().forEach( ( url ) => {
			fetch( url ).catch( () => {} );
		} );
	}, [] );
}
