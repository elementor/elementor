import { setAngieInteractionMode } from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

export const HELP_CENTER_ANGIE_SOURCE = 'help-center';

export const openAngieInAskMode = ( prompt?: string ): void => {
	if ( ! isAngieAvailable() ) {
		return;
	}

	setAngieInteractionMode( 'ask', {
		isOpen: true,
		source: HELP_CENTER_ANGIE_SOURCE,
		prompt,
	} );
};
