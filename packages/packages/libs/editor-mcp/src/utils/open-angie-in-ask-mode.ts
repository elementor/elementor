import {
	AngieInteractionMode,
	getAngieIframe,
	setAngieInteractionMode,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

export const openAngieInAskMode = ( prompt?: string ): void => {
	if ( ! isAngieAvailable() ) {
		return;
	}

	const angieSidebar = getAngieIframe();

	if ( ! angieSidebar ) {
		return;
	}

	toggleAngieSidebar( angieSidebar, true );
	setAngieInteractionMode( AngieInteractionMode.ASK );

	if ( prompt ) {
		window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
	}
};
