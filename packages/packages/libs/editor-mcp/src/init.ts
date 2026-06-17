<<<<<<< HEAD
import { AngieMcpAdapter } from './adapters/angie-adapter';
import { type ModelContext, WebMCPAdapter } from './adapters/web-mcp-adapter';
import { activateAdapters, registerMcpAdapter, signalMcpReady } from './mcp-registry';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';

export function startMCPServer() {
	if ( typeof navigator !== 'undefined' && 'modelContext' in navigator ) {
		registerMcpAdapter(
			new WebMCPAdapter( ( navigator as unknown as { modelContext: ModelContext } ).modelContext )
		);
=======
import { createAndRegisterAdapters, signalMcpReady } from './mcp-registry';

let isInitialized = false;
export function startMCPServer() {
	if ( isInitialized ) {
		return;
>>>>>>> d8bf871c01 (Internal: Added explicit await for angieSDK readiness [ED-24517] (#36207))
	}
	isInitialized = true;

<<<<<<< HEAD
	if ( isAngieAvailable() ) {
		registerMcpAdapter( new AngieMcpAdapter( getSDK() ) );
	}

	activateAdapters();
=======
	createAndRegisterAdapters();
>>>>>>> d8bf871c01 (Internal: Added explicit await for angieSDK readiness [ED-24517] (#36207))
	signalMcpReady();
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => startMCPServer(), { once: true } );
} else {
	startMCPServer();
}
