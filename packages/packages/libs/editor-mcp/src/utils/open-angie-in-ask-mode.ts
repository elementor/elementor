import {
	AngieInteractionMode,
	getAngieIframe,
	setAngieInteractionMode,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

export const HELP_CENTER_ANGIE_SOURCE = 'help-center';

export const openAngieInAskMode = ( prompt?: string ): void => {
	if ( ! isAngieAvailable() ) {
		return;
	}

	const angieSidebar = getAngieIframe();

	if ( ! angieSidebar ) {
		return;
	}

	toggleAngieSidebar( angieSidebar, true );
	setAngieInteractionMode( AngieInteractionMode.ASK, {
		source: HELP_CENTER_ANGIE_SOURCE,
		prompt,
	} );
};
