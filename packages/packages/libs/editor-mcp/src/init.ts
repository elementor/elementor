import { AngieMcpAdapter } from './adapters/angie-adapter';
import { WebMCPAdapter } from './adapters/web-mcp-adapter';
import { activateAdapters, registerMcpAdapter, signalMcpReady } from './mcp-registry';

// Register adapters at module load — before any addTool/resource calls from domain modules.
registerMcpAdapter( new WebMCPAdapter() );
registerMcpAdapter( new AngieMcpAdapter() );

export function startMCPServer() {
	activateAdapters();
	signalMcpReady();
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
