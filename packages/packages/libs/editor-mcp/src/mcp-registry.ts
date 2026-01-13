import { z, type z3 } from '@elementor/schema';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import { ANGIE_MODEL_PREFERENCES, type AngieModelPreferences } from './angie-annotations';
import { mockMcpRegistry } from './test-utils/mock-mcp-registry';
import { getSDK } from './utils/get-sdk';

type ZodRawShape = z3.ZodRawShape;

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
let isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

export const registerMcp = ( mcp: McpServer, name: string ) => {
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
		await sdk.registerLocalServer( {
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
 * @param namespace            The namespace of the MCP server. It should contain only lowercase alphabetic characters.
 * @param options
 * @param options.instructions
 */
export const getMCPByDomain = ( namespace: string, options?: { instructions?: string } ): MCPRegistryEntry => {
	const mcpName = `editor-${ isAlphabet( namespace ) }`;
	// @ts-ignore - QUnit fails this
	if ( typeof globalThis.jest !== 'undefined' ) {
		return mockMcpRegistry();
	}
	if ( ! mcpRegistry[ namespace ] ) {
		mcpRegistry[ namespace ] = new McpServer(
			{
				name: mcpName,
				version: '1.0.0',
			},
			{
				instructions: options?.instructions,
			}
		);
	}
	const mcpServer = mcpRegistry[ namespace ];
	const { addTool } = createToolRegistrator( mcpServer );
	return {
		waitForReady: () => getSDK().waitForReady(),
		// @ts-expect-error: TS is unable to infer the type here
		resource: async ( ...args: Parameters< McpServer[ 'resource' ] > ) => {
			await getSDK().waitForReady();
			return mcpServer.resource( ...args );
		},
		sendResourceUpdated: ( ...args: Parameters< McpServer[ 'server' ][ 'sendResourceUpdated' ] > ) => {
			return new Promise( async () => {
				await getSDK().waitForReady();
				mcpServer.server.sendResourceUpdated( ...args );
			} );
		},
		mcpServer,
		addTool,
		setMCPDescription: ( description: string ) => {
			mcpDescriptions[ namespace ] = description;
		},
		getActiveChatInfo: () => {
			const info = localStorage.getItem( 'angie_active_chat_id' );
			if ( ! info ) {
				return {
					expiresAt: 0,
					sessionId: '',
				};
			}
			const rawData = JSON.parse( info );
			return {
				expiresAt: rawData.expiresAt as number,
				sessionId: rawData.sessionId as string,
			};
		},
	};
};

export interface MCPRegistryEntry {
	addTool: < T extends undefined | z.ZodRawShape = undefined, O extends undefined | z.ZodRawShape = undefined >(
		opts: ToolRegistrationOptions< T, O >
	) => void;
	setMCPDescription: ( description: string ) => void;
	getActiveChatInfo: () => { sessionId: string; expiresAt: number };
	sendResourceUpdated: McpServer[ 'server' ][ 'sendResourceUpdated' ];
	resource: McpServer[ 'resource' ];
	mcpServer: McpServer;
	waitForReady: () => Promise< void >;
}

type ResourceList = {
	uri: string;
	description: string;
}[];

type ToolRegistrationOptions<
	InputArgs extends undefined | z.ZodRawShape = undefined,
	OutputSchema extends undefined | z.ZodRawShape = undefined,
	ExpectedOutput = OutputSchema extends z.ZodRawShape
		? z.objectOutputType< OutputSchema & { llm_instructions?: string }, z.ZodTypeAny >
		: string,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	outputSchema?: OutputSchema;
	handler: InputArgs extends z.ZodRawShape
		? (
				args: z.objectOutputType< InputArgs, z.ZodTypeAny >,
				extra: RequestHandlerExtra< ServerRequest, ServerNotification >
		  ) => ExpectedOutput | Promise< ExpectedOutput >
		: (
				args: unknown,
				extra: RequestHandlerExtra< ServerRequest, ServerNotification >
		  ) => ExpectedOutput | Promise< ExpectedOutput >;
	isDestrcutive?: boolean;
	requiredResources?: ResourceList;
	modelPreferences?: AngieModelPreferences;
};

function createToolRegistrator( server: McpServer ) {
	function addTool<
		T extends undefined | z.ZodRawShape = undefined,
		O extends undefined | z.ZodRawShape = undefined,
	>( opts: ToolRegistrationOptions< T, O > ) {
		const outputSchema = opts.outputSchema as ZodRawShape | undefined;
		if ( outputSchema && ! ( 'llm_instructions' in outputSchema ) ) {
			Object.assign( outputSchema, {
				llm_instruction: z.string().optional().describe( 'Instructions for what to do next' ),
			} );
		}
		// @ts-ignore: TS is unable to infer the type here
		const inputSchema: ZodRawShape = opts.schema ? opts.schema : {};
		const toolCallback: ToolCallback< ZodRawShape > = async function ( args, extra ) {
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
		const annotations: Record< string, unknown > = {
			destructiveHint: opts.isDestrcutive,
			readOnlyHint: opts.isDestrcutive ? false : undefined,
			title: opts.name,
		};
		if ( opts.requiredResources ) {
			annotations[ 'angie/requiredResources' ] = opts.requiredResources;
		}
		if ( opts.modelPreferences ) {
			annotations[ ANGIE_MODEL_PREFERENCES ] = opts.modelPreferences;
		}
		server.registerTool(
			opts.name,
			{
				description: opts.description,
				inputSchema,
				outputSchema,
				title: opts.name,
				annotations,
			},
			toolCallback
		);
		if ( isMcpRegistrationActivated ) {
			server.sendToolListChanged();
		}
	}
	return {
		addTool,
	};
}
