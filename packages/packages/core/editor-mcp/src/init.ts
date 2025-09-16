import { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { activateMcpRegistration } from './mcp-registry';

let sdk: AngieMcpSdk;

const getSDK = () => {
	// @ts-expect-error: QUnit fails this
	if ( typeof globalThis.jest !== 'undefined' ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = new AngieMcpSdk();
	}
	return sdk;
};

export function init() {
	return getSDK().waitForReady();
}

export function startMCPServer() {
	return getSDK()
		.waitForReady()
		.then( () => activateMcpRegistration( sdk ) );
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
