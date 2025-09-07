import { type AnyZodObject, type ZodTypeAny } from 'zod';
import { AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';

import { removeGlobalClass } from './commands/global-styles';
import { listGlobalClasses } from './commands/global-styles/list-global-classes';
import {
	type RemoveGlobalClassInput,
	RemoveGlobalClassParamsSchema,
} from './commands/global-styles/remove-global-class';

const sdk = new AngieMcpSdk();

const toolRegistrations: ( ( mcpServer: McpServer ) => void )[] = [];

type ToolRegistrationOptions<
	InputArgs extends undefined | ZodTypeAny = undefined,
	OutputSchema extends undefined | ZodTypeAny = undefined,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	outputSchema?: OutputSchema;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	handler: Function;
};

export function addTool< T extends undefined | ZodTypeAny = undefined, O extends undefined | ZodTypeAny = undefined >(
	opts: ToolRegistrationOptions< T, O >
) {
	const register = ( mcpServer: McpServer ) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const toolCallback: ToolCallback = async function ( args: any ) {
			try {
				const invocationResult = await opts.handler.call( tool, args );
				const asText =
					typeof invocationResult?.message === 'string'
						? invocationResult.message
						: JSON.stringify( invocationResult );
				if ( opts.outputSchema ) {
					return {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						structuredContent: invocationResult as { [ x: string ]: any },
						content: [ { type: 'text', text: asText } ],
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
		tool.outputSchema = opts.outputSchema as AnyZodObject;
	};
	toolRegistrations.push( register );
}

export async function init() {
	// Register global classes command
	await sdk.waitForReady();
	addTool( {
		name: 'list-global-classes',
		description: 'List all custom global classes (or "styles") defined in the editor',
		// outputSchema: z.array( GlobalClassInfoSchema ).describe( 'List of global classes available in the editor' ),
		handler: listGlobalClasses,
	} );

	addTool( {
		name: 'remove-global-class',
		description: 'Remove a global class by ID or label and unapply it from all elements that use it',
		// outputSchema: RemoveGlobalClassOutputSchema,
		schema: RemoveGlobalClassParamsSchema,
		handler: ( input: RemoveGlobalClassInput ) => removeGlobalClass( input ).then( () => 'Class removed' ),
	} );
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
