import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { activateMcpRegistration } from './mcp-registry';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';

export function init() {
	if ( isExperimentActive( 'editor_mcp' ) && isAngieAvailable() ) {
		return getSDK().waitForReady();
	}
	return Promise.resolve();
}

export function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) && isAngieAvailable() ) {
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
