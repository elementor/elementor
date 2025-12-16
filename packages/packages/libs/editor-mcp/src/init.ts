import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { activateMcpRegistration } from './mcp-registry';

let sdk: AngieMcpSdk;

export const getSDK = () => {
	// @ts-ignore - QUnit fails this
	const isMCPDisabled = !! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;
	if ( isMCPDisabled ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = new AngieMcpSdk();
	}
	return sdk;
};

export function init() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		return getSDK().waitForReady();
	}
	return Promise.resolve();
}

export function startMCPServer() {
	if ( isExperimentActive( 'editor_mcp' ) ) {
		return getSDK()
			.waitForReady()
			.then( () => activateMcpRegistration( sdk ) );
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
