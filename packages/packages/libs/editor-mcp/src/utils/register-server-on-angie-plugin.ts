import { type AngieLocalServerConfig } from '@elementor-external/angie-sdk';

import { getSDK } from './get-sdk';

type AngiePluginWindow = Window & {
	elementorEditorAngie?: { isAngiePluginActive?: boolean };
};

export const registerServerOnAngiePlugin = async ( config: AngieLocalServerConfig ) => {
	if ( ( window as AngiePluginWindow ).elementorEditorAngie?.isAngiePluginActive !== true ) {
		return;
	}

	const sdk = getSDK();

	await sdk.waitForReady();
	await sdk.registerLocalServer( config );
};
