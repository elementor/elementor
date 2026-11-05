import {
	AngieInteractionMode,
	getAngieIframe,
	setAngieInteractionMode,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { isAngieAvailable } from './is-angie-available';

type EditorAngieOpen = ( request: { prompt: string; mode: string } ) => void;

const getLoadedEditorAngie = (): EditorAngieOpen | undefined => {
	return (
		window as Window & {
			elementorV2?: { editorAngie?: { openAngie?: EditorAngieOpen } };
		}
	 ).elementorV2?.editorAngie?.openAngie;
};

export const hasLoadedEditorAngie = (): boolean => Boolean( getLoadedEditorAngie() );

export const openLoadedEditorAngie = ( prompt?: string ): boolean => {
	const openAngie = getLoadedEditorAngie();

	if ( ! openAngie ) {
		return false;
	}

	void openAngie( { prompt: prompt ?? '', mode: 'ask' } );
	return true;
};

export const openAngieInAskMode = ( prompt?: string ): void => {
	if ( openLoadedEditorAngie( prompt ) ) {
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
	setAngieInteractionMode( AngieInteractionMode.ASK );

	if ( prompt ) {
		window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
	}
};
