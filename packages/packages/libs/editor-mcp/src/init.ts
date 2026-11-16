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

// Start right away when the bundle loads after DOMContentLoaded (late or deferred load): the event will
// not fire again, and `waitForMcpReady()` callers would wait forever.
if ( typeof document !== 'undefined' && document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => void startMCPServer(), { once: true } );
} else {
	void startMCPServer();
}
