import { setAngieInteractionMode } from '@elementor-external/angie-sdk';
import type {
	OpenAngieCommonProperties,
	OpenAngiePluginProperties,
	OpenAngieRequest,
	OpenAngieSdkProperties,
} from '@elementor/editor-mcp/open-angie-request';

import { bootAngieSdk, EDITOR_ANGIE_APP_ID } from './boot-angie-sdk';
import { openInstalledAngieSidebar } from './open-installed-angie';

export type { OpenAngieCommonProperties, OpenAngiePluginProperties, OpenAngieRequest, OpenAngieSdkProperties };

let openPanel = () => {};

export const registerAngiePanelOpener = ( opener: () => void ) => {
	openPanel = opener;
};

export const resetAngiePanelOpenerForTests = () => {
	openPanel = () => {};
};

const sendRequestToPlugin = ( request: OpenAngieRequest ): void => {
	setAngieInteractionMode( request.mode );

	if ( ! request.prompt ) {
		return;
	}

	window.location.hash = `angie-prompt=${ encodeURIComponent( request.prompt ) }`;
};

const openSdkAngie = async ( request: OpenAngieRequest ): Promise< void > => {
	openPanel();

	const sdk = await bootAngieSdk();

	// `loadSidebarV2()` only finishes the iframe boot. Wait for the SDK readiness ping too,
	// or the first `triggerAngie()` during startup throws "Angie is not ready".
	await sdk.waitForReady();

	setAngieInteractionMode( request.mode );

	await sdk.triggerAngie( {
		prompt: request.prompt,
		context: request.sdk?.context ?? { source: EDITOR_ANGIE_APP_ID },
		options: request.sdk?.options,
	} );
};

/**
 * Opens Angie through one entry point.
 * The Angie plugin wins when it is active or its sidebar is already on the page.
 * Otherwise the Core SDK opens in the docked panel.
 *
 * @param request - Shared prompt and mode, plus host-specific `sdk` or `plugin` fields.
 */
export const openAngie = async ( request: OpenAngieRequest ): Promise< void > => {
	if ( openInstalledAngieSidebar() ) {
		sendRequestToPlugin( request );
		return;
	}

	await openSdkAngie( request );
};
