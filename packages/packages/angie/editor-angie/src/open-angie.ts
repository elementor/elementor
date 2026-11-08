import { type AngieInteractionMode, setAngieInteractionMode } from '@elementor-external/angie-sdk';

import { bootAngieSdk, EDITOR_ANGIE_APP_ID, openAngieIframe } from './boot-angie-sdk';

let openPanel = () => {};

export const registerAngiePanelOpener = ( opener: () => void ) => {
	openPanel = opener;
};

export const resetAngiePanelOpenerForTests = () => {
	openPanel = () => {};
};

export const openAngie = async ( prompt: string, mode: AngieInteractionMode ): Promise< void > => {
	openPanel();

	const sdk = await bootAngieSdk();

	openAngieIframe();
	setAngieInteractionMode( mode );

	await sdk.triggerAngie( {
		prompt,
		context: {
			source: EDITOR_ANGIE_APP_ID,
		},
	} );
};
