import { type z, type ZodRawShape } from 'zod';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const sdk = new AngieMcpSdk();

const toolRegistrations: ( ( mcpServer: McpServer ) => void )[] = [];

type ToolRegistrationOptions< InputArgs extends ZodRawShape > = {
	name: string;
	description: string;
	schema?: InputArgs;
	handler: ( params: z.objectOutputType< InputArgs, z.ZodTypeAny > ) => unknown | Promise< unknown >;
};

export function addTool< T extends ZodRawShape >( opts: ToolRegistrationOptions< T > ) {
	const register = ( mcpServer: McpServer ) =>
		mcpServer.tool( opts.name, opts.description, opts.schema || {}, async ( args ) => {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify( await opts.handler( args as T ) ),
					},
				],
			};
		} );
	toolRegistrations.push( register );
}

export async function init() {
	// await ready();
}

export async function startMCPServer() {
	await sdk.waitForReady();
	const mcpServer = new McpServer( {
		name: 'v4-editor-server',
		version: '1.0.0',
	} );
	toolRegistrations.forEach( ( register ) => register( mcpServer ) );
	await sdk.registerServer( {
		name: 'page-editor',
		version: '1.0.0',
		description: 'Elementor tools server for editing elementor website pages',
		server: mcpServer,
	} );
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
