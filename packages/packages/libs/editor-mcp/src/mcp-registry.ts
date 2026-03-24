import { z, type z3 } from '@elementor/schema';
import { type AngieMcpSdk } from '@elementor-external/angie-sdk';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import {
	ANGIE_MODEL_PREFERENCES,
	ANGIE_REQUIRED_RESOURCES,
	type AngieModelPreferences,
	createDefaultModelPreferences,
} from './angie-annotations';
import { mockMcpRegistry } from './test-utils/mock-mcp-registry';
import { getSDK } from './utils/get-sdk';

type ZodRawShape = z3.ZodRawShape;

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
const isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

type PendingWaiter = {
	resolve: ( entry: MCPRegistryEntry ) => void;
	timeoutId: ReturnType< typeof setTimeout >;
};

const pendingDomainWaiters: Map< string, Set< PendingWaiter > > = new Map();

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
 * If you need the domain registry and you are not intent to register the actual MCP server, use `getMCPDomainRegistryEntry` instead.
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
			}
		);
	}
	const mcpServer = mcpRegistry[ namespace ];
	const entry = buildRegistryEntry( namespace, mcpServer );

	const waiters = pendingDomainWaiters.get( namespace );
	if ( waiters?.size ) {
		for ( const waiter of waiters ) {
			clearTimeout( waiter.timeoutId );
			waiter.resolve( entry );
		}
		pendingDomainWaiters.delete( namespace );
	}

	return entry;
};

function buildRegistryEntry( namespace: string, mcpServer: McpServer ): MCPRegistryEntry {
	const { addTool } = createToolRegistry( mcpServer );
	return {
		waitForReady: () => getSDK().waitForReady(),
		// @ts-expect-error: TS is unable to infer the type here
		resource: async ( ...args: Parameters< McpServer[ 'registerResource' ] > ) => {
			await getSDK().waitForReady();
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
}

const DEFAULT_MCP_DOMAIN_TIMEOUT_MS = 10_000;

/**
 * Waits for a domain to be initialized via `getMCPByDomain` and returns its registry entry.
 * Resolves with `undefined` if the domain is not initialized within the timeout.
 *
 * Use this instead of `getMCPByDomain` when you are a consumer of a domain you don't own.
 *
 * @param namespace   The namespace of the MCP server (lowercase alphabetic).
 * @param options
 * @param options.timeoutMs  Maximum time to wait in milliseconds. Defaults to 10000.
 */
export const getMCPDomainRegistryEntry = async (
	namespace: string,
	options?: { timeoutMs?: number }
): Promise< MCPRegistryEntry | undefined > => {
	const validatedNamespace = isAlphabet( namespace );
	const timeoutMs = options?.timeoutMs ?? DEFAULT_MCP_DOMAIN_TIMEOUT_MS;

	// @ts-ignore - QUnit fails this
	if ( typeof globalThis.jest !== 'undefined' ) {
		return mockMcpRegistry();
	}

	if ( mcpRegistry[ validatedNamespace ] ) {
		return buildRegistryEntry( validatedNamespace, mcpRegistry[ validatedNamespace ] );
	}

	return new Promise< MCPRegistryEntry | undefined >( ( resolve ) => {
		const timeoutId = setTimeout( () => {
			const waiters = pendingDomainWaiters.get( validatedNamespace );
			if ( waiters ) {
				waiters.delete( waiter );
				if ( waiters.size === 0 ) {
					pendingDomainWaiters.delete( validatedNamespace );
				}
			}
			resolve( undefined );
		}, timeoutMs );

		const waiter: PendingWaiter = { resolve, timeoutId };
		const existing = pendingDomainWaiters.get( validatedNamespace );
		if ( existing ) {
			existing.add( waiter );
		} else {
			pendingDomainWaiters.set( validatedNamespace, new Set( [ waiter ] ) );
		}
	} );
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
		if ( isMcpRegistrationActivated ) {
			server.sendToolListChanged();
		}
	}
	return {
		addTool,
	};
}
