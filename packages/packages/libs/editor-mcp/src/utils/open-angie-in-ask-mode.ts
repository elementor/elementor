import {
	AngieInteractionMode,
	getAngieIframe,
	setAngieInteractionMode,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

const getLoadedEditorAngie = () => {
	return window.elementorV2?.editorAngie?.openAngie;
};

export const hasLoadedEditorAngie = (): boolean => Boolean( getLoadedEditorAngie() );

export const openLoadedEditorAngie = ( prompt: string | undefined, mode: AngieInteractionMode ): boolean => {
	const openAngie = getLoadedEditorAngie();

	if ( ! openAngie ) {
		return false;
	}

	Promise.resolve( openAngie( { prompt: prompt ?? '', mode } ) ).catch( ( error ) => {
		// eslint-disable-next-line no-console
		console.error( 'Failed to open Angie:', error );
	} );

	return true;
};

export const openAngieInAskMode = ( prompt?: string ): void => {
	openAngieInMode( prompt, AngieInteractionMode.ASK );
};

export const openAngieInAgentMode = ( prompt?: string ): void => {
	openAngieInMode( prompt, AngieInteractionMode.AGENT );
};

const openAngieInMode = ( prompt: string | undefined, mode: AngieInteractionMode ): void => {
	if ( openLoadedEditorAngie( prompt, mode ) ) {
		return;
	}

	if ( ! isAngieAvailable() ) {
		return;
	}

	const angieSidebar = getAngieIframe();

	if ( ! angieSidebar ) {
		return;
	}

	toggleAngieSidebar( angieSidebar, true );
	setAngieInteractionMode( mode );

	if ( prompt ) {
		window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
	}
};
