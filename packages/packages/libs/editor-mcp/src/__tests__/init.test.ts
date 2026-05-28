import { type ModelContext, WebMCPAdapter } from '../adapters/web-mcp-adapter';
import { startMCPServer } from '../init';
import { activateAdapters, registerMcpAdapter, signalMcpReady } from '../mcp-registry';

jest.mock( '../mcp-registry', () => ( {
	activateAdapters: jest.fn(),
	registerMcpAdapter: jest.fn(),
	signalMcpReady: jest.fn(),
} ) );

jest.mock( '../utils/get-sdk', () => ( {
	getSDK: jest.fn(),
} ) );

jest.mock( '../utils/is-angie-available', () => ( {
	isAngieAvailable: jest.fn( () => false ),
} ) );

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
	const mockRegisterMcpAdapter = jest.mocked( registerMcpAdapter );
	const adapter = mockRegisterMcpAdapter.mock.calls[ 0 ][ 0 ];

	expect( adapter ).toBeInstanceOf( WebMCPAdapter );

	return ( adapter as unknown as { ctx: ModelContext } ).ctx;
};

describe( 'startMCPServer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
		expect( registerMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( getRegisteredWebMCPAdapterContext() ).toBe( documentModelContext );
		expect( activateAdapters ).toHaveBeenCalledTimes( 1 );
		expect( signalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the navigator model context for older browser support', () => {
		// Arrange.
		const navigatorModelContext = createModelContext();

		setModelContext( navigator, navigatorModelContext );

		// Act.
		startMCPServer();

		// Assert.
		expect( registerMcpAdapter ).toHaveBeenCalledTimes( 1 );
		expect( getRegisteredWebMCPAdapterContext() ).toBe( navigatorModelContext );
		expect( activateAdapters ).toHaveBeenCalledTimes( 1 );
		expect( signalMcpReady ).toHaveBeenCalledTimes( 1 );
	} );
} );
