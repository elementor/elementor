import {
	createSDK,
	EDITOR_ANGIE_APP_ID,
	getSDK,
	refreshSdkIfDetectionExpired,
	resetSdkForTests,
	setSDK,
	waitForSDK,
} from '../get-sdk';

const mockConstructor = jest.fn();
const mockDestroy = jest.fn();
const mockDetection = { resolve: ( _result: { isReady: boolean } ) => {} };

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: class {
		angieDetector = {
			waitForReady: () =>
				new Promise( ( resolve ) => {
					mockDetection.resolve = resolve;
				} ),
		};

		constructor( ...args: unknown[] ) {
			mockConstructor( ...args );
		}

		destroy() {
			mockDestroy();
		}
	},
	getAngieIframe: jest.fn(),
	MessageEventType: {},
} ) );

const GLOBAL_MCP_DISABLED_FLAG = '__ELEMENTOR_MCP_DISABLED__';

const settleDetection = async ( result: { isReady: boolean } ) => {
	mockDetection.resolve( result );
	await Promise.resolve();
};

describe( 'get-sdk', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetSdkForTests();
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should create an SDK bound to the editor app id', () => {
		// Act
		createSDK();

		// Assert
		expect( mockConstructor ).toHaveBeenCalledTimes( 1 );
		expect( mockConstructor ).toHaveBeenCalledWith( { appId: EDITOR_ANGIE_APP_ID } );
	} );

	it( 'should return the SDK provided by editor-angie', () => {
		// Arrange
		const provided = createSDK();
		setSDK( provided );

		// Act
		const first = getSDK();
		const second = getSDK();

		// Assert
		expect( first ).toBe( provided );
		expect( second ).toBe( provided );
		expect( mockConstructor ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should throw when no SDK was provided yet', () => {
		// Act & Assert
		expect( () => getSDK() ).toThrow( 'Angie SDK was not provided by editor-angie yet' );
	} );

	it( 'should resolve waiters with the provided SDK', async () => {
		// Arrange
		const provided = createSDK();
		setSDK( provided );

		// Act
		const resolved = await waitForSDK();

		// Assert
		expect( resolved ).toBe( provided );
	} );

	it( 'should create an empty SDK when MCP is disabled', () => {
		// Arrange
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;

		// Act
		const sdk = createSDK();

		// Assert
		expect( sdk ).toEqual( {} );
		expect( mockConstructor ).not.toHaveBeenCalled();
	} );
} );

describe( 'refreshSdkIfDetectionExpired', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetSdkForTests();
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should replace the SDK when Angie detection gave up', async () => {
		// Arrange
		const expired = createSDK();
		setSDK( expired );
		await settleDetection( { isReady: false } );

		// Act
		const wasRefreshed = refreshSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( true );
		expect( mockDestroy ).toHaveBeenCalledTimes( 1 );
		expect( getSDK() ).not.toBe( expired );
	} );

	it( 'should keep the SDK when Angie was detected', async () => {
		// Arrange
		const ready = createSDK();
		setSDK( ready );
		await settleDetection( { isReady: true } );

		// Act
		const wasRefreshed = refreshSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getSDK() ).toBe( ready );
	} );

	it( 'should keep the SDK while detection is still running', () => {
		// Arrange
		const detecting = createSDK();
		setSDK( detecting );

		// Act
		const wasRefreshed = refreshSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getSDK() ).toBe( detecting );
	} );

	it( 'should not fail when MCP is disabled', () => {
		// Arrange
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
		setSDK( createSDK() );

		// Act
		const wasRefreshed = refreshSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
	} );
} );
