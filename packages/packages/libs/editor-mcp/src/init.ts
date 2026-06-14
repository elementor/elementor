import { AngieMcpAdapter } from './adapters/angie-adapter';
import { type ModelContext, WebMCPAdapter } from './adapters/web-mcp-adapter';
import { activateAdapters, registerMcpAdapter, signalMcpReady } from './mcp-registry';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';

type ModelContextHost = {
	modelContext?: ModelContext;
};

function getModelContext(): ModelContext | undefined {
	const documentModelContext =
		typeof document !== 'undefined' ? ( document as unknown as ModelContextHost ).modelContext : undefined;
	const navigatorModelContext =
		typeof navigator !== 'undefined' ? ( navigator as unknown as ModelContextHost ).modelContext : undefined;

	return documentModelContext || navigatorModelContext;
}

export function startMCPServer() {
	const modelContext = getModelContext();

	if ( modelContext ) {
		registerMcpAdapter( new WebMCPAdapter( modelContext ) );
	}

	if ( isAngieAvailable() ) {
		registerMcpAdapter( new AngieMcpAdapter( getSDK() ) );
	}

	activateAdapters().then( () => {
		signalMcpReady();
	} );
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', () => startMCPServer(), { once: true } );
} else {
	startMCPServer();
}
