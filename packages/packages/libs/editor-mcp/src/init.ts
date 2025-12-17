import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { getSDK } from './get-sdk';
import { activateMcpRegistration } from './mcp-registry';

export function init() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		return getSDK().waitForReady();
	}
	return Promise.resolve();
}

export function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		const sdk = getSDK();
		sdk.waitForReady().then( () => activateMcpRegistration( sdk ) );
	}
	return Promise.resolve();
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
