import { AngieMcpAdapter } from './adapters/angie-adapter';
import { type ModelContext, WebMCPAdapter } from './adapters/web-mcp-adapter';
import { initManagePostMcp } from './manage-post-mcp';
import { activateAdapters, registerMcpAdapter, signalMcpReady } from './mcp-registry';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';

export function startMCPServer() {
	if ( typeof navigator !== 'undefined' && 'modelContext' in navigator ) {
		registerMcpAdapter(
			new WebMCPAdapter( ( navigator as unknown as { modelContext: ModelContext } ).modelContext )
		);
	}

	if ( isAngieAvailable() ) {
		registerMcpAdapter( new AngieMcpAdapter( getSDK() ) );
	}

	initManagePostMcp();

	activateAdapters();
	signalMcpReady();
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => startMCPServer(), { once: true } );
} else {
	startMCPServer();
}
