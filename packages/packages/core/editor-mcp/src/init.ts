import { z } from 'zod';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export async function init() {
	// AngieMcpSdk;
	// McpServer;
	const mcpServer = new McpServer( {
		name: 'elementor-editor',
		version: '1.0.0',
	} );
	const sdk = new AngieMcpSdk();

	mcpServer.tool(
		'greet',
		'Create a nice greeting message for anyone you like',
		{
			name: z.string().nonempty().describe( 'Name of the person to greet' ),
		},
		async ( { name }: { name: string } ) => {
			return {
				structuredContent: {
					metadata: `Hello, ${ name }! Welcome to Elementor pro!`,
					message: 'No message provided',
				},
				content: [ { type: 'text', text: 'Here is the data (JSON Formatted structured content)' } ],
			};
		}
	);

	await sdk.registerServer( {
		name: 'editor',
		version: '1.0.0',
		description: 'Elementor tools for editing website pages',
		server: mcpServer,
	} );
	// console.log( 'Initializing Editor MCP...' );
}
