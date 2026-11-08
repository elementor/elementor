import { AngieInteractionMode, getAngieIframe, toggleAngieSidebar } from '@elementor-external/angie-sdk';

import { openLoadedEditorAngie } from './open-angie-in-ask-mode';

export const sendPromptToAngie = ( prompt?: string ) => {
	if ( openLoadedEditorAngie( prompt, AngieInteractionMode.AGENT ) ) {
		return;
	}

	const angieSidebar = getAngieIframe();

	if ( ! angieSidebar ) {
		return;
	}

	toggleAngieSidebar( angieSidebar, true );

	if ( ! prompt ) {
		return;
	}

	window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
};
