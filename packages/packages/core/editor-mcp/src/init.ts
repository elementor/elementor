import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { activateMcpRegistration } from './mcp-registry';

let sdk: AngieMcpSdk;

const getSDK = () => {
	// @ts-ignore: QUnit fails this
	if ( typeof jest !== 'undefined' ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = new AngieMcpSdk();
	}
	return sdk;
};

export async function init() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		await getSDK().waitForReady();
	}
}

export async function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		await getSDK().waitForReady();
		await activateMcpRegistration( sdk );
	}
}

document.addEventListener(
	'DOMContentLoaded',
	() => {
		startMCPServer();
	},
	{
		once: true,
	}
);
