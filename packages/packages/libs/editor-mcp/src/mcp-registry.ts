import { z, type z3 } from '@elementor/schema';
import { McpServer, type ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { type ServerNotification, type ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import apiFetch from '@wordpress/api-fetch';

import { AngieMcpAdapter } from './adapters/angie-adapter';
import {
  type IMcpRegistrationAdapter,
  type McpResourceHandler,
  type McpResourceUriOrTemplate,
} from './adapters/types';
import { WebMCPAdapter } from './adapters/web-mcp-adapter';
import {
  ANGIE_MODEL_PREFERENCES,
  ANGIE_REQUIRED_RESOURCES,
  type AngieModelPreferences,
  createDefaultModelPreferences,
} from './angie-annotations';
import { mockMcpRegistry } from './test-utils/mock-mcp-registry';
import { getModelContext } from './utils/get-model-context';
import { getSDK } from './utils/get-sdk';
import { isAngieAvailable } from './utils/is-angie-available';
import { mergeRequiredResources, type ResourceList } from './utils/merge-required-resources';
import { registerServerDocsResource } from './utils/register-server-docs-resource';
import { toMCPTitle } from './utils/to-mcp-title';

export const signal = {
  END: Symbol(),
  CONTINUE: Symbol(),
} as const;

type BeforeCallResult =
  | undefined
  | [ typeof signal.CONTINUE, { newParams: unknown } ]
  | [ typeof signal.END, { result: unknown } ];

type AfterCallResult = undefined | [ typeof signal.END, { result: unknown } ];

export interface ProxyToolHooks {
  beforeCall?: ( input: unknown ) => Promise< BeforeCallResult >;
  afterCall?: ( response: unknown ) => Promise< AfterCallResult >;
  afterResponse?: ( result: unknown ) => Promise< void >;
}

export interface ProxyToolOptions {
  hooks?: ProxyToolHooks;
  description?: string;
}

type ZodRawShape = z3.ZodRawShape;

const mcpRegistry: { [ namespace: string ]: McpServer } = {};
const mcpDescriptions: { [ namespace: string ]: string } = {};
// @ts-ignore - QUnit fails this
const isMcpRegistrationActivated = false || typeof globalThis.jest !== 'undefined';

const registrationAdapters: IMcpRegistrationAdapter[] = [];
const bufferedTools: Parameters< IMcpRegistrationAdapter[ 'onToolRegistered' ] >[] = [];
const bufferedResources: Parameters< IMcpRegistrationAdapter[ 'onResourceRegistered' ] >[] = [];

type PendingProxyTool = {
  name: string;
  options?: ProxyToolOptions;
  namespace: string;
  serverDocsUri?: string;
};
const pendingProxyTools: PendingProxyTool[] = [];

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

export const signalMcpReady = (): void => {
  resolveReady();
};

export const createAndRegisterAdapters = async (): Promise< void > => {
  const modelContext = getModelContext();

  if ( modelContext ) {
    registerMcpAdapter( new WebMCPAdapter( modelContext ) );
  }

  if ( isAngieAvailable() ) {
    registerMcpAdapter( new AngieMcpAdapter( getSDK(), getRegisteredMcpServers ) );
  }

  await Promise.all( registrationAdapters.map( ( adapter ) => adapter.activate() ) );
};

// utility function to run a callback on all MCP interfaces
function callAdapters( fn: ( adapter: IMcpRegistrationAdapter ) => unknown ) {
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
  return Object.entries( mcpRegistry ).map( ( [ key, server ] ) => [
    key,
    server,
    mcpDescriptions[ key ] || key,
  ] );
};

const buildProxyHandler =
  ( toolName: string, hooks?: ProxyToolHooks ) => async ( args: unknown ) => {
    let input = args;

    if ( hooks?.beforeCall ) {
      const beforeResult = await hooks.beforeCall( input );
      if ( Array.isArray( beforeResult ) && beforeResult[ 0 ] === signal.END ) {
        return ( beforeResult[ 1 ] as { result: unknown } ).result;
      }
      if ( Array.isArray( beforeResult ) && beforeResult[ 0 ] === signal.CONTINUE ) {
        input = ( beforeResult[ 1 ] as { newParams: unknown } ).newParams;
      }
    }

    const response = await apiFetch< { data: unknown } >( {
      path: '/elementor/v1/mcp-proxy',
      method: 'POST',
      data: { tool: toolName, input },
    } );

    let result = response.data;

    if ( hooks?.afterCall ) {
      const afterResult = await hooks.afterCall( result );
      if ( Array.isArray( afterResult ) && afterResult[ 0 ] === signal.END ) {
        result = ( afterResult[ 1 ] as { result: unknown } ).result;
      }
    }

    if ( hooks?.afterResponse ) {
      Promise.resolve( hooks.afterResponse( result ) ).catch( ( e ) =>
        /* eslint-disable-next-line no-console */
        console.error( '[mcp-proxy] afterResponse hook error:', e )
      );
    }

    return result;
  };

export const activateProxyTools = async (): Promise< void > => {
  await Promise.all(
    pendingProxyTools.map( async ( { name, options, namespace, serverDocsUri } ) => {
      try {
        const response = await apiFetch< { data: { inputSchema: object; description: string } } >( {
          path: `/elementor/v1/mcp-proxy?schema=${ encodeURIComponent( name ) }`,
        } );
        const { inputSchema, description } = response.data;
        const mcpServer = mcpRegistry[ namespace ];
        const { addTool } = createToolRegistry( mcpServer, `editor-${ namespace }`, serverDocsUri );
        addTool( {
          name,
          description: options?.description ?? description,
          schema: inputSchema as ZodRawShape,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: buildProxyHandler( name, options?.hooks ) as any,
        } );
      } catch ( error ) {
        /* eslint-disable-next-line no-console */
        console.error( `[mcp-proxy] Failed to register proxy tool "${ name }":`, error );
      }
    } )
  );
  pendingProxyTools.length = 0;
};

const isAlphabet = ( str: string ): string | never => {
  const passes = !! str && /^[a-z_]+$/.test( str );
  if ( ! passes ) {
    throw new Error( 'Not alphabet' );
  }
  return str;
};

/**
 * @param namespace            The namespace of the MCP server. It should contain only lowercase alphabetic characters.
 * @param options
 * @param options.instructions Short hint about the MCP and its toolset (MCP SDK `instructions`; keeps payload small).
 * @param options.docs         Full documentation registered as a lazy-loaded resource.
 *                             When provided, it is registered at elementor://{namespace}/server-docs
 *                             and auto-injected into every tool's requiredResources.
 */
export const getMCPByDomain = (
  namespace: string,
  options?: { docs?: string; instructions?: string }
): MCPRegistryEntry => {
  const mcpName = `editor-${ isAlphabet( namespace ) }`;
  const title = toMCPTitle( namespace );
  // @ts-ignore - QUnit fails this
  if ( typeof globalThis.jest !== 'undefined' ) {
    return mockMcpRegistry();
  }
  if ( ! mcpRegistry[ namespace ] ) {
    mcpRegistry[ namespace ] = new McpServer(
      { name: mcpName, title, version: '1.0.0' },
      { instructions: options?.instructions, capabilities: { resources: { subscribe: true } } }
    );
    if ( options?.docs ) {
      registerServerDocsResource(
        mcpRegistry[ namespace ],
        namespace,
        title,
        options.docs,
        ( ...args ) => {
          bufferedResources.push( args );
          callAdapters( ( adapter ) => adapter.onResourceRegistered( ...args ) );
        }
      );
    }
  }
  const mcpServer = mcpRegistry[ namespace ];
  const serverDocsUri = options?.docs ? `elementor://${ namespace }/server-docs` : undefined;
  const { addTool } = createToolRegistry( mcpServer, mcpName, serverDocsUri );
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
    sendResourceUpdated: (
      ...args: Parameters< McpServer[ 'server' ][ 'sendResourceUpdated' ] >
    ) => {
      callAdapters( ( adapter ) => adapter.sendResourceUpdated( { uri: args[ 0 ].uri } ) );
      return Promise.resolve( mcpServer.server.sendResourceUpdated( ...args ) ).catch(
        ( error: Error ) => {
          if ( error?.message?.includes( 'Not connected' ) ) {
            return; // Expected when no MCP client is connected yet
          }
          if ( error?.message?.includes( 'does not support notifying about resources' ) ) {
            return; // Server capability not declared — safe to ignore
          }
          throw error;
        }
      );
    },
    addTool,
    setMCPDescription: ( description: string ) => {
      mcpDescriptions[ namespace ] = description;
    },
    addProxyTool: ( name: string, proxyOptions?: ProxyToolOptions ) => {
      pendingProxyTools.push( { name, options: proxyOptions, namespace, serverDocsUri } );
    },
  };
};

export interface MCPRegistryEntry {
  addTool: <
    T extends undefined | z.ZodRawShape = undefined,
    O extends undefined | z.ZodRawShape = undefined,
  >(
    opts: ToolRegistrationOptions< T, O >
  ) => void;
  addProxyTool: ( name: string, options?: ProxyToolOptions ) => void;
  setMCPDescription: ( description: string ) => void;
  sendResourceUpdated: McpServer[ 'server' ][ 'sendResourceUpdated' ];
  resource: McpServer[ 'registerResource' ];
  waitForReady: () => Promise< void >;
}

type ToolRegistrationOptions<
  InputArgs extends undefined | z.ZodRawShape = undefined,
  OutputSchema extends undefined | z.ZodRawShape = undefined,
  ExpectedOutput = OutputSchema extends z.ZodRawShape
    ? z.objectOutputType< OutputSchema, z.ZodTypeAny >
    : string,
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

function createToolRegistry( server: McpServer, serverName: string, serverDocsUri?: string ) {
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
              text:
                ( ( error as Error ).message || 'Unknown error' ) +
                JSON.stringify(
                  ( error as { response?: { data: unknown } } ).response?.data || error
                ),
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
    const mergedResources = mergeRequiredResources( opts.requiredResources, serverDocsUri );
    const angieAnnotations = {
      [ ANGIE_MODEL_PREFERENCES ]: opts.modelPreferences ?? createDefaultModelPreferences(),
      [ ANGIE_REQUIRED_RESOURCES ]: mergedResources,
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
        toolCallback(
          params as Parameters< typeof toolCallback >[ 0 ],
          /* WebMCP: no protocol session — handlers must not rely on `extra` here */
          {} as RequestHandlerExtra< ServerRequest, ServerNotification >
        ) as Promise< unknown >,
    };
    const extraData = {
      resources: [ `Server resource name: ${ serverName }, Required to fetch!` ],
      requiredResources: mergedResources?.map( ( resource ) => resource.uri ) ?? [],
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
