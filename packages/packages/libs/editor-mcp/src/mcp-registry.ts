import { z, type z3 } from '@elementor/schema';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { UriTemplate } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import { type IMcpRegistrationAdapter, type McpResourceHandler, type McpResourceUriOrTemplate } from './adapters/types';
import {
	ANGIE_MODEL_PREFERENCES,
	ANGIE_REQUIRED_RESOURCES,
	type AngieModelPreferences,
	createDefaultModelPreferences,
} from './angie-annotations';
import { mockMcpRegistry } from './test-utils/mock-mcp-registry';

type ZodRawShape = z3.ZodRawShape;

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
const isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

const registrationAdapters: IMcpRegistrationAdapter[] = [];
const bufferedTools: Parameters< IMcpRegistrationAdapter[ 'onToolRegistered' ] >[] = [];
const bufferedResources: Parameters< IMcpRegistrationAdapter[ 'onResourceRegistered' ] >[] = [];

let resolveReady!: () => void;
const readyPromise = new Promise< void >( ( resolve ) => {
	resolveReady = resolve;
} );

export const registerMcpAdapter = ( adapter: IMcpRegistrationAdapter ): void => {
	registrationAdapters.push( adapter );
	for ( const tool of bufferedTools ) {
		try {
			adapter.onToolRegistered( tool[ 0 ], tool[ 1 ] );
		} catch {
			// exit quietly
		}
	}
	for ( const resource of bufferedResources ) {
		try {
			adapter.onResourceRegistered( ...resource );
		} catch {
			// exit quietly
		}
	}
};

export const signalMcpReady = (): void => resolveReady();

export const activateAdapters = (): void => callAdapters( ( adapter ) => adapter.activate() );

function callAdapters( fn: ( adapter: IMcpRegistrationAdapter ) => void ): void {
	for ( const adapter of registrationAdapters ) {
		try {
			fn( adapter );
		} catch {
			// adapter failed — exit quietly, continue to next
		}
	}
}

export const registerMcp = ( mcp: McpServer, name: string ) => {
	const mcpName = isAlphabet( name );
	mcpRegistry[ mcpName ] = mcp;
};

export const getRegisteredMcpServers = (): Array< [ string, McpServer, string ] > => {
	return Object.entries( mcpRegistry ).map( ( [ key, server ] ) => [ key, server, mcpDescriptions[ key ] || key ] );
};

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
		if ( !! options?.instructions ) {
			callAdapters( ( adapter ) =>
				adapter.onResourceRegistered( `${ mcpName }`, { uriTemplate: new UriTemplate( mcpName ) }, () =>
					Promise.resolve( { contents: [ { text: options.instructions ?? '' } ] } )
				)
			);
		}
	}
	const mcpServer = mcpRegistry[ namespace ];
	const { addTool } = createToolRegistry( mcpServer, mcpName );
	return {
		waitForReady: () => readyPromise,
		// @ts-expect-error: TS is unable to infer the type here
		resource: async ( ...args: Parameters< McpServer[ 'registerResource' ] > ) => {
			const [ name, uriOrTemplate, ...rest ] = args as [ string, unknown, ...unknown[] ];
			const handler = rest[ rest.length - 1 ] as McpResourceHandler;
			const resourceArgs: Parameters< IMcpRegistrationAdapter[ 'onResourceRegistered' ] > = [
				name,
				uriOrTemplate as McpResourceUriOrTemplate,
				handler,
			];
			bufferedResources.push( resourceArgs );
			callAdapters( ( adapter ) => adapter.onResourceRegistered( ...resourceArgs ) );
			return mcpServer.registerResource( ...args );
		},
		sendResourceUpdated: ( ...args: Parameters< McpServer[ 'server' ][ 'sendResourceUpdated' ] > ) => {
			callAdapters( ( adapter ) => adapter.sendResourceUpdated( { uri: args[ 0 ].uri } ) );
			return Promise.resolve( mcpServer.server.sendResourceUpdated( ...args ) ).catch( ( error: Error ) => {
				if ( error?.message?.includes( 'Not connected' ) ) {
					return; // Expected when no MCP client is connected yet
				}
				if ( error?.message?.includes( 'does not support notifying about resources' ) ) {
					return; // Server capability not declared — safe to ignore
				}
				throw error;
			} );
		},
		addTool,
		setMCPDescription: ( description: string ) => {
			mcpDescriptions[ namespace ] = description;
		},
	};
};

export interface MCPRegistryEntry {
	addTool: < T extends undefined | z.ZodRawShape = undefined, O extends undefined | z.ZodRawShape = undefined >(
		opts: ToolRegistrationOptions< T, O >
	) => void;
	setMCPDescription: ( description: string ) => void;
	sendResourceUpdated: McpServer[ 'server' ][ 'sendResourceUpdated' ];
	resource: McpServer[ 'registerResource' ];
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

function createToolRegistry( server: McpServer, serverName: string ) {
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
		const toolDescriptor = {
			name: opts.name,
			description: opts.description,
			inputSchema: inputSchema as object,
			execute: ( params: Record< string, unknown > ) =>
				Promise.resolve(
					toolCallback(
						params as Parameters< typeof toolCallback >[ 0 ],
						/* WebMCP: no protocol session — handlers must not rely on `extra` here */
						{} as RequestHandlerExtra< ServerRequest, ServerNotification >
					)
				),
		};
		const extraData = {
			resources: [ `Server resource name: ${ serverName }, Required to fetch!` ],
			requiredResources: opts.requiredResources?.map( ( resource ) => resource.uri ) ?? [],
		};
		bufferedTools.push( [ toolDescriptor, extraData ] );
		callAdapters( ( adapter ) => adapter.onToolRegistered( toolDescriptor, extraData ) );
		if ( isMcpRegistrationActivated ) {
			server.sendToolListChanged();
		}
	}
	return {
		addTool,
	};
}
