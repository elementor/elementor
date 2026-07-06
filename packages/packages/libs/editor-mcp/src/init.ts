import { createAndRegisterAdapters, signalMcpReady } from './mcp-registry';

let isInitialized = false;
export function startMCPServer() {
	if ( isInitialized ) {
		return;
	}
	isInitialized = true;

	void createAndRegisterAdapters().then( () => signalMcpReady() );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => startMCPServer(), { once: true } );
} else {
	startMCPServer();
}
