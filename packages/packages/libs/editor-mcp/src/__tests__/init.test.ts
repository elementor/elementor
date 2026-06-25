import { type ModelContext, WebMCPAdapter } from '../adapters/web-mcp-adapter';

const mockRegisterMcpAdapter = jest.fn();
const mockSignalMcpReady = jest.fn();

jest.mock( '../mcp-registry', () => {
	const { WebMCPAdapter: WebMCPAdapterClass } = jest.requireActual( '../adapters/web-mcp-adapter' );
	const { getModelContext } = jest.requireActual( '../utils/get-model-context' );

	return {
		registerMcpAdapter: mockRegisterMcpAdapter,
		signalMcpReady: mockSignalMcpReady,
		createAndRegisterAdapters: () => {
			const modelContext = getModelContext();

			if ( modelContext ) {
				mockRegisterMcpAdapter( new WebMCPAdapterClass( modelContext ) );
			}
		},
	};
} );

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

const getRegisteredWebMCPAdapterContext = (): ModelContext => {
	const { WebMCPAdapter } =
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		jest.requireActual< typeof import('../adapters/web-mcp-adapter') >( '../adapters/web-mcp-adapter' );
	const adapter = mockRegisterMcpAdapter.mock.calls[ 0 ][ 0 ];

	expect( adapter ).toBeInstanceOf( WebMCPAdapter );

	return ( adapter as unknown as { ctx: ModelContext } ).ctx;
};

describe( 'startMCPServer', () => {
	let startMCPServer: InitModule[ 'startMCPServer' ];

	beforeEach( () => {
		jest.clearAllMocks();
		startMCPServer = loadStartMCPServer();
	} );

	afterEach( () => {
		deleteModelContext( document );
		deleteModelContext( navigator );
	} );

	it( 'prefers the document model context when it is available', () => {
		// Arrange.
		const documentModelContext = createModelContext();
		const navigatorModelContext = createModelContext();

		setModelContext( document, documentModelContext );
		setModelContext( navigator, navigatorModelContext );

		// Act.
		startMCPServer();

		// Assert.
		expect( mockRegisterMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( getRegisteredWebMCPAdapterContext() ).toBe( documentModelContext );
		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the navigator model context for older browser support', () => {
		// Arrange.
		const navigatorModelContext = createModelContext();

		setModelContext( navigator, navigatorModelContext );

		// Act.
		startMCPServer();

		// Assert.
		expect( mockRegisterMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( getRegisteredWebMCPAdapterContext() ).toBe( navigatorModelContext );
		expect( mockSignalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );
} );
