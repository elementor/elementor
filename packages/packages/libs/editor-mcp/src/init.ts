import { createAndRegisterAdapters, signalMcpReady } from './mcp-registry';

let isInitialized = false;
export function startMCPServer() {
	if ( isInitialized ) {
		return;
	}
	isInitialized = true;

	void createAndRegisterAdapters()
		.then( () => signalMcpReady() )
		.catch( ( error ) => {
			/* eslint-disable-next-line no-console */
			console.error( 'MCP adapter activation failed:', error );
			signalMcpReady();
		} );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => startMCPServer(), { once: true } );
} else {
	startMCPServer();
}
