import { z, type z3 } from '@elementor/schema';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

import {
	ANGIE_MODEL_PREFERENCES,
	ANGIE_REQUIRED_RESOURCES,
	type AngieModelPreferences,
	createDefaultModelPreferences,
} from './angie-annotations';
import { mockMcpRegistry } from './test-utils/mock-mcp-registry';
import { getSDK } from './utils/get-sdk';
import { registerWebMCPResource, registerWebMCPTool } from './web-mcp-adapter';

type ZodRawShape = z3.ZodRawShape;

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
const isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

export const registerMcp = ( mcp: McpServer, name: string ) => {
	const mcpName = isAlphabet( name );
	mcpRegistry[ mcpName ] = mcp;
};

export async function activateMcpRegistration( sdk: AngieMcpSdk, entries = Object.entries( mcpRegistry ), retry = 3 ) {
	if ( retry === 0 ) {
		/* eslint-disable-next-line no-console */
		console.error( 'Failed to register MCP after 3 retries. failed entries: ', entries );
		return;
	}
	if ( entries.length === 0 ) {
		return;
	}
	const failed = [];
	for await ( const entry of entries ) {
		const [ key, mcpServer ] = entry;
		try {
			await sdk.registerLocalServer( {
				title: toMCPTitle( key ),
				name: `editor-${ key }`,
				server: mcpServer,
				version: '1.0.0',
				description: mcpDescriptions[ key ] || key,
			} );
		} catch {
			failed.push( entry );
		}
	}
	if ( failed.length > 0 ) {
		return activateMcpRegistration( sdk, failed, retry - 1 );
	}
}

const isAlphabet = ( str: string ): string | never => {
	const passes = !! str && /^[a-z_]+$/.test( str );
	if ( ! passes ) {
		throw new Error( 'Not alphabet' );
	}
	return str;
};

export const toMCPTitle = ( namespace: string ): string => {
	const capitalized = namespace.charAt( 0 ).toUpperCase() + namespace.slice( 1 );
	return `Editor ${ capitalized }`;
};

/**
 *
 * @param namespace            The namespace of the MCP server. It should contain only lowercase alphabetic characters.
 * @param options
 * @param options.instructions
 */
export const getMCPByDomain = ( namespace: string, options?: { instructions?: string } ): MCPRegistryEntry => {
	const mcpName = `editor-${ isAlphabet( namespace ) }`;
	const title = toMCPTitle( namespace );
	// @ts-ignore - QUnit fails this
	if ( typeof globalThis.jest !== 'undefined' ) {
		return mockMcpRegistry();
	}
	if ( ! mcpRegistry[ namespace ] ) {
		mcpRegistry[ namespace ] = new McpServer(
			{
				name: mcpName,
				title,
				version: '1.0.0',
			},
			{
				instructions: options?.instructions,
				capabilities: { resources: { subscribe: true } },
			}
		);
	}
	const mcpServer = mcpRegistry[ namespace ];
	const { addTool } = createToolRegistry( mcpServer );
	return {
		waitForReady: () => getSDK().waitForReady(),
		// @ts-expect-error: TS is unable to infer the type here
		resource: async ( ...args: Parameters< McpServer[ 'registerResource' ] > ) => {
			await getSDK().waitForReady();
			const [ name, uriOrTemplate, ...rest ] = args as [ string, unknown, ...unknown[] ];
			const handler = rest[ rest.length - 1 ] as ( uri: URL, variables: Record< string, string | string[] > ) => Promise< { contents: Array< { text?: string } > } >;
			registerWebMCPResource( name, uriOrTemplate as string | { uriTemplate: { toString(): string; match( uri: string ): Record< string, string | string[] > | null } }, handler );
			return mcpServer.registerResource( ...args );
		},
		sendResourceUpdated: ( ...args: Parameters< McpServer[ 'server' ][ 'sendResourceUpdated' ] > ) => {
			return getSDK()
				.waitForReady()
				.then( () => mcpServer.server.sendResourceUpdated( ...args ) )
				.catch( ( error: Error ) => {
					if ( error?.message?.includes( 'Not connected' ) ) {
						return; // Expected when no MCP client is connected yet
					}
					if ( error?.message?.includes( 'does not support notifying about resources' ) ) {
						return; // Server capability not declared — safe to ignore
					}
					throw error;
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
	resource: McpServer[ 'registerResource' ];
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
	ExpectedOutput = OutputSchema extends z.ZodRawShape ? z.objectOutputType< OutputSchema, z.ZodTypeAny > : string,
> = {
	name: string;
	description: string;
	schema?: InputArgs;
	/**
	 * Auto added fields:
	 * @param errors z.string().optional().describe('Error message if the tool failed')
	 */
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
	isDestructive?: boolean;
	requiredResources?: ResourceList;
	modelPreferences?: AngieModelPreferences;
};

function createToolRegistry( server: McpServer ) {
	function addTool<
		T extends undefined | z.ZodRawShape = undefined,
		O extends undefined | z.ZodRawShape = undefined,
	>( opts: ToolRegistrationOptions< T, O > ) {
		const outputSchema = opts.outputSchema as ZodRawShape | undefined;
		if ( outputSchema ) {
			Object.assign(
				outputSchema,
				outputSchema.errors ?? {
					errors: z.string().optional().describe( 'Error message if the tool failed' ),
				}
			);
		}
		// @ts-ignore: TS is unable to infer the type here
		const inputSchema: ZodRawShape = opts.schema ? opts.schema : {};
		const toolCallback: ToolCallback< ZodRawShape > = async function ( args, extra ) {
			try {
				const invocationResult = await opts.handler( opts.schema ? args : {}, extra );
				return {
					// structuredContent: typeof invocationResult === 'string' ? undefined : invocationResult,
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
					structuredContent: {
						errors: ( error as Error ).message || 'Unknown error',
					},
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
			destructiveHint: opts.isDestructive,
			readOnlyHint: opts.isDestructive ? false : undefined,
			title: opts.name,
		};
		const angieAnnotations = {
			[ ANGIE_MODEL_PREFERENCES ]: opts.modelPreferences ?? createDefaultModelPreferences(),
			[ ANGIE_REQUIRED_RESOURCES ]: opts.requiredResources ?? undefined,
		};
		server.registerTool(
			opts.name,
			{
				description: opts.description,
				inputSchema,
				// TODO: Uncomment this when the outputSchema is stable
				// outputSchema,
				title: opts.name,
				annotations,
				_meta: angieAnnotations,
			},
			toolCallback
		);
		registerWebMCPTool( {
			name: opts.name,
			description: opts.description,
			inputSchema: zodToJsonSchema( z.object( inputSchema ) ),
			execute: ( params ) =>
				Promise.resolve(
					toolCallback(
						params as Parameters< typeof toolCallback >[ 0 ],
						/* WebMCP: no protocol session — handlers must not rely on `extra` here */
						{} as RequestHandlerExtra< ServerRequest, ServerNotification >
					)
				),
		} );
		if ( isMcpRegistrationActivated ) {
			server.sendToolListChanged();
		}
	}
	return {
		addTool,
	};
}
