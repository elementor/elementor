import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const mockRegisterLocalServer = jest.fn();
const mockWaitForReady = jest.fn();

const mockDefaultSdk = {
	waitForReady: () => mockWaitForReady(),
	registerLocalServer: ( ...args: unknown[] ) => mockRegisterLocalServer( ...args ),
};
const mockScopedSdk = {
	waitForReady: () => mockWaitForReady(),
	registerLocalServer: ( ...args: unknown[] ) => mockRegisterLocalServer( ...args ),
};

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: ( instanceKey?: string ) => ( instanceKey === 'scoped' ? mockScopedSdk : mockDefaultSdk ),
} ) );

const TITLE_GENERATION_NAMESPACE = 'title_generation';
const CANVAS_NAMESPACE = 'canvas';

const createServer = ( name: string ) => new McpServer( { name, version: '1.0.0' } );

const getRegisteredServerNames = () =>
	mockRegisterLocalServer.mock.calls.map( ( [ config ] ) => ( config as { name: string } ).name );

describe( 'registerAngieMcpServers', () => {
	beforeEach( () => {
		jest.resetModules();
		mockRegisterLocalServer.mockReset();
		mockWaitForReady.mockReset();
		mockRegisterLocalServer.mockResolvedValue( undefined );
		mockWaitForReady.mockResolvedValue( undefined );
	} );

	it( 'registers only the requested namespaces with Angie', async () => {
		// Arrange
		const { registerMcp, registerAngieMcpServers } = await import( '../mcp-registry' );
		registerMcp( createServer( TITLE_GENERATION_NAMESPACE ), TITLE_GENERATION_NAMESPACE );
		registerMcp( createServer( CANVAS_NAMESPACE ), CANVAS_NAMESPACE );

		// Act
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ], mockScopedSdk as never );

		// Assert
		expect( getRegisteredServerNames() ).toEqual( [ `editor-${ TITLE_GENERATION_NAMESPACE }` ] );
	} );

	it( 'uses separate registration scopes per SDK instance', async () => {
		// Arrange
		const { registerMcp, registerAngieMcpServers } = await import( '../mcp-registry' );
		registerMcp( createServer( TITLE_GENERATION_NAMESPACE ), TITLE_GENERATION_NAMESPACE );
		registerMcp( createServer( CANVAS_NAMESPACE ), CANVAS_NAMESPACE );

		// Act
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ], mockScopedSdk as never );
		await registerAngieMcpServers( [ CANVAS_NAMESPACE ], mockDefaultSdk as never );

		// Assert
		expect( mockRegisterLocalServer ).toHaveBeenCalledTimes( 2 );
		expect( getRegisteredServerNames() ).toEqual(
			expect.arrayContaining( [ `editor-${ TITLE_GENERATION_NAMESPACE }`, `editor-${ CANVAS_NAMESPACE }` ] )
		);
	} );

	it( 'registers every namespace when the full adapter is activated', async () => {
		// Arrange
		const { registerMcp, ensureAngieMcpAdapter } = await import( '../mcp-registry' );
		registerMcp( createServer( TITLE_GENERATION_NAMESPACE ), TITLE_GENERATION_NAMESPACE );
		registerMcp( createServer( CANVAS_NAMESPACE ), CANVAS_NAMESPACE );

		// Act
		await ensureAngieMcpAdapter();

		// Assert
		expect( getRegisteredServerNames() ).toEqual(
			expect.arrayContaining( [ `editor-${ TITLE_GENERATION_NAMESPACE }`, `editor-${ CANVAS_NAMESPACE }` ] )
		);
	} );

	it( 'does not register the same scope twice', async () => {
		// Arrange
		const { registerMcp, registerAngieMcpServers } = await import( '../mcp-registry' );
		registerMcp( createServer( TITLE_GENERATION_NAMESPACE ), TITLE_GENERATION_NAMESPACE );

		// Act
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ], mockScopedSdk as never );
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ], mockScopedSdk as never );

		// Assert
		expect( mockRegisterLocalServer ).toHaveBeenCalledTimes( 1 );
	} );
} );
