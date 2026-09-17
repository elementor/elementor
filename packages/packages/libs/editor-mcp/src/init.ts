import { createAndRegisterAdapters, signalMcpReady } from './mcp-registry';

let isInitialized = false;
export async function startMCPServer() {
	if ( isInitialized ) {
		return;
	}
	isInitialized = true;
	try {
		await createAndRegisterAdapters();
	} catch ( error ) {
		/* eslint-disable-next-line no-console */
		console.error( 'MCP adapter activation failed:', error );
	} finally {
		signalMcpReady();
	}
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => void startMCPServer(), { once: true } );
} else {
	void startMCPServer();
}
