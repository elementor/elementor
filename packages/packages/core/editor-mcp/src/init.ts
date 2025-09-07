import { type AnyZodObject, type z, type ZodType } from 'zod';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import registerGlobalClassesTools from './commands/global-styles';
import initWidgetsCommands from './commands/widgets/list-widgets';

const sdk = new AngieMcpSdk();

const toolRegistrations: ( ( mcpServer: McpServer ) => void )[] = [];

type ToolRegistrationOptions<
	InputArgs extends undefined | ZodType = undefined,
	OutputSchema extends undefined | ZodType = undefined,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	outputSchema?: OutputSchema;

	handler: (
		args: InputArgs extends z.ZodType ? z.infer< InputArgs > : undefined,
		server: McpServer,
		extra: RequestHandlerExtra< ServerRequest, ServerNotification >
	) => Promise< OutputSchema extends z.ZodType ? z.infer< OutputSchema > : undefined >;
};

export function addTool< T extends undefined | ZodType = undefined, O extends undefined | ZodType = undefined >(
	opts: ToolRegistrationOptions< T, O >
) {
	const register = ( mcpServer: McpServer ) => {
		const toolCallback = async function (
			args: T extends ZodType ? z.infer< T > : undefined,
			extra: RequestHandlerExtra< ServerRequest, ServerNotification >
		) {
			try {
				const invocationResult = await opts.handler.call( tool, args, mcpServer, extra );
				const asText =
					!! invocationResult && 'message' in invocationResult && typeof invocationResult.message === 'string'
						? invocationResult.message
						: JSON.stringify( invocationResult );
				if ( opts.outputSchema ) {
					return {
						// structuredContent: invocationResult as { [ x: string ]: any },
						content: [ { type: 'text', text: `This is the tool's response in JSON format:\n${ asText }` } ],
					};
				}
				return {
					content: [ { type: 'text', text: asText } ],
				};
			} catch ( error ) {
				return {
					isError: true,
					content: [
						{
							type: 'text',
							text: `Error running tool "${ opts.name }": ${
								error instanceof Error ? error.message : 'Unknown error'
							}`,
						},
					],
				};
			}
		};

		const tool = mcpServer.tool( opts.name, toolCallback as unknown as ToolCallback );
		tool.description = opts.description;
		if ( typeof opts.schema !== 'undefined' ) {
			tool.inputSchema = opts.schema as AnyZodObject;
		}
		// tool.outputSchema = opts.outputSchema as AnyZodObject;
	};
	toolRegistrations.push( register );
}

export async function init() {
	// Register global classes command
	await sdk.waitForReady();
	registerGlobalClassesTools( addTool );
	initWidgetsCommands( addTool );
}

export async function startMCPServer() {
	await sdk.waitForReady();
	const mcpServer = new McpServer( {
		name: 'elementor-editor',
		title: 'Elementor Editor MCP Server, supports V4 editor operations',
		version: '1.0.0',
	} );
	toolRegistrations.forEach( ( register ) => register( mcpServer ) );
	await sdk.registerServer( {
		name: 'elementor_editor-tools',
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
