import { type AngieLocalServerConfig, getAngieSdk } from '@elementor/editor-angie-sdk';

type AngiePluginWindow = Window & {
	elementorEditorAngie?: { isAngiePluginActive?: boolean };
};

export const registerServerOnAngiePlugin = async ( config: AngieLocalServerConfig ) => {
	if ( ( window as AngiePluginWindow ).elementorEditorAngie?.isAngiePluginActive !== true ) {
		return;
	}

	try {
		const sdk = getAngieSdk();

		await sdk.waitForReady();
		await sdk.registerLocalServer( config );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `Angie plugin registration failed for "${ config.name }":`, error );
	}
};
