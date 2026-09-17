import { getAngieSdk } from '@elementor/editor-mcp';

import { createElementorCapabilitiesServer } from './elementor-capabilities-mcp-server';

export function init() {
	const sdk = getAngieSdk();
	sdk.waitForReady().then( () => {
		const capabilitiesServer = createElementorCapabilitiesServer();
		sdk.registerServer( {
			name: 'elementor-capabilities',
			version: '2.0.0',
			description: 'Elementor Capabilities Gateway',
			server: capabilitiesServer,
			capabilities: {
				tools: {},
			},
		} );
		// eslint-disable-next-line no-console
		console.log( '[Elementor Capabilities MCP] Module initialized' );
	} );
}
