import { type AngieMcpSdk } from '@elementor-external/angie-sdk';
import { type z, type ZodRawShape, type ZodTypeAny } from '@elementor/schema';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import { mockMcpRegistry } from './test-utils/mock-mcp-registry';

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
let isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

export const registerMcp = ( mcp: McpServer, name: string ) => {
	if ( isMcpRegistrationActivated ) {
		throw new Error( 'MCP Registration is already activated. Cannot register new MCP servers.' );
	}
	const mcpName = isAlphabet( name );
	mcpRegistry[ mcpName ] = mcp;
};

export async function activateMcpRegistration( sdk: AngieMcpSdk ) {
	if ( isMcpRegistrationActivated ) {
		return;
	}
	isMcpRegistrationActivated = true;
	const mcpServerList = Object.entries( mcpRegistry );
	for await ( const entry of mcpServerList ) {
		const [ key, mcpServer ] = entry;
		await sdk.registerServer( {
			name: `editor-${ key }`,
			server: mcpServer,
			version: '1.0.0',
			description: mcpDescriptions[ key ] || key,
		} );
	}
}

const isAlphabet = ( str: string ): string | never => {
	const passes = !! str && /^[a-z_]+$/.test( str );
	if ( ! passes ) {
		throw new Error( 'Not alphabet' );
	}
	return str;
};

/**
 *
 * @param namespace The namespace of the MCP server. It should contain only lowercase alphabetic characters.
 */
export const getMCPByDomain = ( namespace: string ): MCPRegistryEntry => {
	const mcpName = `editor-${ isAlphabet( namespace ) }`;
	// @ts-ignore - QUnit fails this
	if ( typeof globalThis.jest !== 'undefined' ) {
		return mockMcpRegistry();
	}
	if ( ! mcpRegistry[ namespace ] ) {
		mcpRegistry[ namespace ] = new McpServer( {
			name: mcpName,
			version: '1.0.0',
		} );
	}
	const mcpServer = mcpRegistry[ namespace ];
	const { addTool } = createToolRegistrator( mcpServer );
	return {
		addTool,
		setMCPDescription: ( description: string ) => {
			mcpDescriptions[ namespace ] = description;
		},
	};
};

export interface MCPRegistryEntry {
	addTool: < T extends undefined | ZodRawShape = undefined, O extends undefined | ZodRawShape = undefined >(
		opts: ToolRegistrationOptions< T, O >
	) => void;
	setMCPDescription: ( description: string ) => void;
}

type ToolRegistrationOptions<
	InputArgs extends undefined | ZodRawShape = undefined,
	OutputSchema extends undefined | ZodRawShape = undefined,
	ExpectedOutput = OutputSchema extends ZodRawShape ? z.objectOutputType< OutputSchema, ZodTypeAny > : string,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	outputSchema?: OutputSchema;
	handler: InputArgs extends ZodRawShape
		? (
				args: z.objectOutputType< InputArgs, ZodTypeAny >,
				extra: RequestHandlerExtra< ServerRequest, ServerNotification >
		  ) => ExpectedOutput | Promise< ExpectedOutput >
		: (
				args: unknown,
				extra: RequestHandlerExtra< ServerRequest, ServerNotification >
		  ) => ExpectedOutput | Promise< ExpectedOutput >;
	isDestrcutive?: boolean;
};

function createToolRegistrator( server: McpServer ) {
	function addTool< T extends undefined | ZodRawShape = undefined, O extends undefined | ZodRawShape = undefined >(
		opts: ToolRegistrationOptions< T, O >
	) {
		const inputSchema: ZodRawShape = opts.schema ? opts.schema : {};
		if ( isMcpRegistrationActivated ) {
			throw new Error( 'MCP Registration is already activated. Cannot add new tools.' );
		}
		const toolCallback: ToolCallback< typeof inputSchema > = async function ( args, extra ) {
			try {
				const invocationResult = await opts.handler( opts.schema ? args : {}, extra );
				return {
					structuredContent: typeof invocationResult === 'string' ? undefined : invocationResult,
					content: [
						{
							type: 'text',
							text:
								typeof invocationResult === 'string'
									? invocationResult
									: JSON.stringify( invocationResult ),
						},
					],
				};
			} catch ( error ) {
				return {
					isError: true,
					content: [
						{
							type: 'text',
							text: ( error as Error ).message || 'Unknown error',
						},
					],
				};
			}
		};
		server.registerTool(
			opts.name,
			{
				description: opts.description,
				inputSchema,
				outputSchema: opts.outputSchema,
				title: opts.name,
				annotations: {
					destructiveHint: opts.isDestrcutive,
					readOnlyHint: opts.isDestrcutive ? false : undefined,
					title: opts.name,
				},
			},
			toolCallback
		);
	}
	return {
		addTool,
	};
}
