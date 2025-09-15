import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { activateMcpRegistration } from './mcp-registry';

const sdk = new AngieMcpSdk();

export async function init() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		await sdk.waitForReady();
	}
}

export async function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		await sdk.waitForReady();
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
