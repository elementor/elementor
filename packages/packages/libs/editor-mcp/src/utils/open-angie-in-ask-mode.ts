import { navigateAngieIframe } from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

export const HELP_CENTER_ANGIE_SOURCE = 'help-center';

export const openAngieInAskMode = ( prompt?: string ): void => {
	if ( ! isAngieAvailable() ) {
		return;
	}

	navigateAngieIframe( 'ask', {
		isOpen: true,
		isStudioOpen: false,
		source: HELP_CENTER_ANGIE_SOURCE,
	} );

	if ( prompt ) {
		window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
	}
};
