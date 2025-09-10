import { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { activateMcpRegistration } from './mcp-registry';

const sdk = new AngieMcpSdk();

export async function init() {
	// Register global classes command
	await sdk.waitForReady();
}

export async function startMCPServer() {
	await sdk.waitForReady();
	await activateMcpRegistration( sdk );
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
