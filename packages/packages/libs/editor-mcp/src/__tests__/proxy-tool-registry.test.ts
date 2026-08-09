import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
  activateProxyTools,
  getMCPByDomain,
  type ProxyToolOptions,
  registerMcp,
  signal,
} from '../mcp-registry';

const mockApiFetch = jest.fn();

jest.mock( '@wordpress/api-fetch', () => ( {
  __esModule: true,
  default: ( ...args: unknown[] ) => mockApiFetch( ...args ),
} ) );

jest.mock( '@modelcontextprotocol/sdk/server/mcp.js', () => ( {
  McpServer: jest.fn().mockImplementation( () => ( {
    registerTool: jest.fn(),
    sendToolListChanged: jest.fn(),
    server: { sendResourceUpdated: jest.fn() },
  } ) ),
} ) );

jest.mock( '../adapters/angie-adapter', () => ( { AngieMcpAdapter: jest.fn() } ) );
jest.mock( '../adapters/web-mcp-adapter', () => ( { WebMCPAdapter: jest.fn() } ) );
jest.mock( '../utils/get-model-context', () => ( { getModelContext: () => null } ) );
jest.mock( '../utils/get-sdk', () => ( { getSDK: jest.fn() } ) );
jest.mock( '../utils/is-angie-available', () => ( { isAngieAvailable: () => false } ) );
jest.mock( '../utils/to-mcp-title', () => ( { toMCPTitle: ( name: string ) => name } ) );
jest.mock( '../utils/register-server-docs-resource', () => ( {
  registerServerDocsResource: jest.fn(),
} ) );

const createMockServer = () => ( {
  registerTool: jest.fn(),
  sendToolListChanged: jest.fn(),
  server: { sendResourceUpdated: jest.fn() },
} );

const buildSchemaResponse = ( description = 'server description', inputSchema: object = {} ) => ( {
  data: { inputSchema, description },
} );

const buildPostResponse = ( data: object = { someResult: true } ) => ( { data } );

const withoutJestGlobal = ( fn: () => void ): void => {
  const g = globalThis as Record< string, unknown >;
  const saved = g.jest;
  delete g.jest;
  try {
    fn();
  } finally {
    g.jest = saved;
  }
};

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
let namespaceCounter = 0;
const nextNamespace = () => `ns${ ALPHA[ namespaceCounter++ % 26 ] }`;

const addProxyToolForTest = (
  toolName: string,
  options?: ProxyToolOptions
): { mockServer: ReturnType< typeof createMockServer >; namespace: string } => {
  const namespace = nextNamespace();
  const mockServer = createMockServer();
  registerMcp( mockServer as unknown as McpServer, namespace );
  withoutJestGlobal( () => {
    getMCPByDomain( namespace ).addProxyTool( toolName, options );
  } );
  return { mockServer, namespace };
};

type ToolCallback = ( args: unknown ) => Promise< unknown >;

const getLastRegisteredHandler = ( registerToolMock: jest.Mock ): ToolCallback => {
  const lastCall = registerToolMock.mock.calls[ registerToolMock.mock.calls.length - 1 ];
  return lastCall[ 2 ] as ToolCallback;
};

describe( 'addProxyTool', () => {
  beforeEach( () => {
    mockApiFetch.mockClear();
  } );

  afterEach( async () => {
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );
    await activateProxyTools();
  } );

  it( 'triggers a schema GET for the registered tool name on activation', async () => {
    // Arrange
    const { mockServer } = addProxyToolForTest( 'my-tool' );
    mockApiFetch.mockResolvedValue( buildSchemaResponse( 'test tool' ) );

    // Act
    await activateProxyTools();

    // Assert
    expect( mockApiFetch ).toHaveBeenCalledWith( {
      path: '/elementor/v1/mcp-proxy?schema=my-tool',
    } );
    expect( mockServer.registerTool ).toHaveBeenCalledWith(
      'my-tool',
      expect.objectContaining( { description: 'test tool' } ),
      expect.any( Function )
    );
  } );

  it( 'uses options.description instead of server description when provided', async () => {
    // Arrange
    const { mockServer } = addProxyToolForTest( 'my-tool', { description: 'custom description' } );
    mockApiFetch.mockResolvedValue( buildSchemaResponse( 'server description' ) );

    // Act
    await activateProxyTools();

    // Assert
    expect( mockServer.registerTool ).toHaveBeenCalledWith(
      'my-tool',
      expect.objectContaining( { description: 'custom description' } ),
      expect.any( Function )
    );
  } );
} );

describe( 'activateProxyTools', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach( () => {
    mockApiFetch.mockClear();
    consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
  } );

  afterEach( async () => {
    consoleErrorSpy.mockRestore();
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );
    await activateProxyTools();
  } );

  it( 'resolves successfully when the pending buffer is empty', async () => {
    // Arrange — no proxy tools registered

    // Act + Assert
    await expect( activateProxyTools() ).resolves.toBeUndefined();
  } );

  it( 'fetches schema for each registered proxy tool', async () => {
    // Arrange
    addProxyToolForTest( 'tool-alpha' );
    addProxyToolForTest( 'tool-beta' );
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );

    // Act
    await activateProxyTools();

    // Assert
    expect( mockApiFetch ).toHaveBeenCalledWith( {
      path: '/elementor/v1/mcp-proxy?schema=tool-alpha',
    } );
    expect( mockApiFetch ).toHaveBeenCalledWith( {
      path: '/elementor/v1/mcp-proxy?schema=tool-beta',
    } );
  } );

  it( 'continues registering remaining tools when one schema fetch fails', async () => {
    // Arrange
    const { mockServer: failingServer } = addProxyToolForTest( 'failing-tool' );
    const { mockServer: okServer } = addProxyToolForTest( 'ok-tool' );
    mockApiFetch
      .mockRejectedValueOnce( new Error( 'network error' ) )
      .mockResolvedValueOnce( buildSchemaResponse( 'ok description' ) );

    // Act
    await activateProxyTools();

    // Assert
    expect( consoleErrorSpy ).toHaveBeenCalledWith(
      expect.stringContaining( 'failing-tool' ),
      expect.any( Error )
    );
    expect( failingServer.registerTool ).not.toHaveBeenCalled();
    expect( okServer.registerTool ).toHaveBeenCalledTimes( 1 );
  } );

  it( 'clears the pending buffer so a second activation does not re-register tools', async () => {
    // Arrange
    addProxyToolForTest( 'buffered-tool' );
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );
    await activateProxyTools();
    mockApiFetch.mockClear();

    // Act — second activation with an empty buffer
    await activateProxyTools();

    // Assert
    expect( mockApiFetch ).not.toHaveBeenCalled();
  } );
} );

describe( 'buildProxyHandler hook pipeline', () => {
  let consoleErrorSpy: jest.SpyInstance;

  const activateToolAndGetHandler = async (
    toolName: string,
    options?: ProxyToolOptions
  ): Promise< ToolCallback > => {
    const { mockServer } = addProxyToolForTest( toolName, options );
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );
    await activateProxyTools();
    return getLastRegisteredHandler( mockServer.registerTool );
  };

  beforeEach( () => {
    mockApiFetch.mockClear();
    consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
  } );

  afterEach( async () => {
    consoleErrorSpy.mockRestore();
    mockApiFetch.mockResolvedValue( buildSchemaResponse() );
    await activateProxyTools();
  } );

  it( 'POSTs to mcp-proxy with the tool name and original input', async () => {
    // Arrange
    const handler = await activateToolAndGetHandler( 'proxy-tool' );
    mockApiFetch.mockResolvedValue( buildPostResponse() );

    // Act
    await handler( { query: 'hello' } );

    // Assert
    expect( mockApiFetch ).toHaveBeenCalledWith( {
      path: '/elementor/v1/mcp-proxy',
      method: 'POST',
      data: { tool: 'proxy-tool', input: { query: 'hello' } },
    } );
  } );

  it( 'beforeCall CONTINUE signal replaces input sent to mcp-proxy', async () => {
    // Arrange
    const beforeCall = jest
      .fn()
      .mockResolvedValue( [ signal.CONTINUE, { newParams: { replaced: true } } ] );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { beforeCall } } );
    mockApiFetch.mockResolvedValue( buildPostResponse() );

    // Act
    await handler( { original: true } );

    // Assert
    expect( mockApiFetch ).toHaveBeenCalledWith( {
      path: '/elementor/v1/mcp-proxy',
      method: 'POST',
      data: { tool: 'proxy-tool', input: { replaced: true } },
    } );
  } );

  it( 'beforeCall END signal skips POST and returns the provided result', async () => {
    // Arrange
    const shortCircuitResult = { shortCircuited: true };
    const beforeCall = jest
      .fn()
      .mockResolvedValue( [ signal.END, { result: shortCircuitResult } ] );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { beforeCall } } );

    // Act
    const result = await handler( { original: true } );

    // Assert
    expect( mockApiFetch ).not.toHaveBeenCalledWith(
      expect.objectContaining( { method: 'POST' } )
    );
    expect( result ).toEqual(
      expect.objectContaining( {
        content: [ { type: 'text', text: JSON.stringify( shortCircuitResult ) } ],
      } )
    );
  } );

  it( 'afterCall END signal replaces the server response', async () => {
    // Arrange
    const overriddenResult = { overridden: true };
    const afterCall = jest.fn().mockResolvedValue( [ signal.END, { result: overriddenResult } ] );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { afterCall } } );
    mockApiFetch.mockResolvedValue( buildPostResponse( { original: true } ) );

    // Act
    const result = await handler( {} );

    // Assert
    expect( result ).toEqual(
      expect.objectContaining( {
        content: [ { type: 'text', text: JSON.stringify( overriddenResult ) } ],
      } )
    );
  } );

  it( 'afterCall undefined signal passes the server response through unchanged', async () => {
    // Arrange
    const afterCall = jest.fn().mockResolvedValue( undefined );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { afterCall } } );
    const serverData = { value: 42 };
    mockApiFetch.mockResolvedValue( buildPostResponse( serverData ) );

    // Act
    const result = await handler( {} );

    // Assert
    expect( result ).toEqual(
      expect.objectContaining( {
        content: [ { type: 'text', text: JSON.stringify( serverData ) } ],
      } )
    );
  } );

  it( 'afterResponse is invoked with the final result after the response is returned', async () => {
    // Arrange
    const afterResponse = jest.fn().mockResolvedValue( undefined );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { afterResponse } } );
    const serverData = { finalResult: true };
    mockApiFetch.mockResolvedValue( buildPostResponse( serverData ) );

    // Act
    await handler( {} );

    // Assert
    expect( afterResponse ).toHaveBeenCalledWith( serverData );
  } );

  it( 'afterResponse rejection does not affect the returned tool result', async () => {
    // Arrange
    const afterResponse = jest.fn().mockRejectedValue( new Error( 'side effect failed' ) );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { afterResponse } } );
    mockApiFetch.mockResolvedValue( buildPostResponse() );

    // Act + Assert
    await expect( handler( {} ) ).resolves.toBeDefined();
  } );

  it( 'unexpected hook throw produces isError response', async () => {
    // Arrange
    const beforeCall = jest.fn().mockRejectedValue( new Error( 'hook exploded' ) );
    const handler = await activateToolAndGetHandler( 'proxy-tool', { hooks: { beforeCall } } );

    // Act
    const result = ( await handler( {} ) ) as { isError: boolean };

    // Assert
    expect( result.isError ).toBe( true );
  } );
} );
