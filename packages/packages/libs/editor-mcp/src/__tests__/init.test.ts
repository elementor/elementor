import { type ModelContext } from '../adapters/web-mcp-adapter';

const mockRegisterMcpAdapter = jest.fn();
const mockSignalMcpReady = jest.fn();
const mockCreateAndRegisterAdapters = jest.fn( async () => {
	const { WebMCPAdapter: WebMCPAdapterClass } = jest.requireActual( '../adapters/web-mcp-adapter' );
	const { getModelContext } = jest.requireActual( '../utils/get-model-context' );
	const modelContext = getModelContext();

	if ( modelContext ) {
		const adapter = new WebMCPAdapterClass( modelContext );
		mockRegisterMcpAdapter( adapter );
		await adapter.activate();
	}
} );

jest.mock( '../mcp-registry', () => ( {
	registerMcpAdapter: mockRegisterMcpAdapter,
	signalMcpReady: mockSignalMcpReady,
	createAndRegisterAdapters: () => mockCreateAndRegisterAdapters(),
} ) );

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: jest.fn(),
} ) );

jest.mock( '../utils/is-angie-available', () => ( {
	isAngieAvailable: jest.fn( () => false ),
} ) );

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type InitModule = typeof import('../init');

const loadStartMCPServer = (): InitModule[ 'startMCPServer' ] => {
	jest.resetModules();

	return ( require( '../init' ) as InitModule ).startMCPServer;
};

const createModelContext = (): ModelContext => ( {
	registerTool: jest.fn(),
	unregisterTool: jest.fn(),
} );

const setModelContext = ( target: object, modelContext: ModelContext ): void => {
	Object.defineProperty( target, 'modelContext', {
		configurable: true,
		value: modelContext,
	} );
};

const deleteModelContext = ( target: object ): void => {
	Reflect.deleteProperty( target, 'modelContext' );
};

const flushPromises = (): Promise< void > => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'startMCPServer', () => {
	let startMCPServer: InitModule[ 'startMCPServer' ];
	let consoleErrorSpy: jest.SpyInstance;

	beforeEach( () => {
		jest.clearAllMocks();
		consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
		startMCPServer = loadStartMCPServer();
	} );

	afterEach( () => {
		consoleErrorSpy.mockRestore();
		deleteModelContext( document );
		deleteModelContext( navigator );
	} );

	it( 'prefers the document model context when it is available', async () => {
		// Arrange.
		const documentModelContext = createModelContext();
		const navigatorModelContext = createModelContext();

		setModelContext( document, documentModelContext );
		setModelContext( navigator, navigatorModelContext );

		// Act.
		startMCPServer();
		await flushPromises();

		// Assert.
		expect( mockRegisterMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( documentModelContext.registerTool ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'editor-resource-getter' } )
		);
		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the navigator model context for older browser support', async () => {
		// Arrange.
		const navigatorModelContext = createModelContext();

		setModelContext( navigator, navigatorModelContext );

		// Act.
		startMCPServer();
		await flushPromises();

		// Assert.
		expect( mockRegisterMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( navigatorModelContext.registerTool ).toHaveBeenCalledWith(
			expect.objectContaining( { name: 'editor-resource-getter' } )
		);
		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'signals MCP readiness only after async activation completes', async () => {
		// Arrange.
		let resolveRegisterTool!: () => void;
		const documentModelContext = createModelContext();
		documentModelContext.registerTool = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveRegisterTool = resolve;
				} )
		);

		setModelContext( document, documentModelContext );

		// Act.
		startMCPServer();
		await flushPromises();

		// Assert.
		expect( mockSignalMcpReady ).not.toHaveBeenCalled();

		resolveRegisterTool();
		await flushPromises();

		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'signals MCP readiness when adapter activation fails', async () => {
		// Arrange.
		const activationError = new Error( 'activation failed' );
		mockCreateAndRegisterAdapters.mockRejectedValueOnce( activationError );

		// Act.
		startMCPServer();
		await flushPromises();

		// Assert.
		expect( consoleErrorSpy ).toHaveBeenCalledWith( 'MCP adapter activation failed:', activationError );
		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );
} );
