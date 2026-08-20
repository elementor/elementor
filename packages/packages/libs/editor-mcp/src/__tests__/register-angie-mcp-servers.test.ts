import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const mockRegisterLocalServer = jest.fn();
const mockWaitForReady = jest.fn();

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: () => ( {
		waitForReady: () => mockWaitForReady(),
		registerLocalServer: ( ...args: unknown[] ) => mockRegisterLocalServer( ...args ),
	} ),
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
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ] );

		// Assert
		expect( getRegisteredServerNames() ).toEqual( [ `editor-${ TITLE_GENERATION_NAMESPACE }` ] );
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
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ] );
		await registerAngieMcpServers( [ TITLE_GENERATION_NAMESPACE ] );

		// Assert
		expect( mockRegisterLocalServer ).toHaveBeenCalledTimes( 1 );
	} );
} );
