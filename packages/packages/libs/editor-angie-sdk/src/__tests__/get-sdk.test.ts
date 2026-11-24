import { EDITOR_ANGIE_APP_ID, getAngieSdk, refreshAngieSdkIfDetectionExpired, resetAngieSdkForTests } from '../get-sdk';

const mockConstructor = jest.fn();
const mockDestroy = jest.fn();
const mockDetection: { resolve: ( result: { isReady: boolean } ) => void } = { resolve: () => {} };

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
} ) );

const GLOBAL_MCP_DISABLED_FLAG = '__ELEMENTOR_MCP_DISABLED__';

const settleDetection = async ( result: { isReady: boolean } ) => {
	mockDetection.resolve( result );
	await Promise.resolve();
};

describe( 'getAngieSdk', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetAngieSdkForTests();
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should create a single SDK instance bound to the editor app id', () => {
		// Act
		const first = getAngieSdk();
		const second = getAngieSdk();

		// Assert
		expect( second ).toBe( first );
		expect( mockConstructor ).toHaveBeenCalledTimes( 1 );
		expect( mockConstructor ).toHaveBeenCalledWith( { appId: EDITOR_ANGIE_APP_ID } );
	} );

	it( 'should return an empty SDK when MCP is disabled', () => {
		// Arrange
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;

		// Act
		const sdk = getAngieSdk();

		// Assert
		expect( sdk ).toEqual( {} );
		expect( mockConstructor ).not.toHaveBeenCalled();
	} );
} );

describe( 'refreshAngieSdkIfDetectionExpired', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetAngieSdkForTests();
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should replace the SDK when Angie detection gave up', async () => {
		// Arrange
		const expired = getAngieSdk();
		await settleDetection( { isReady: false } );

		// Act
		const wasRefreshed = refreshAngieSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( true );
		expect( mockDestroy ).toHaveBeenCalledTimes( 1 );
		expect( getAngieSdk() ).not.toBe( expired );
	} );

	it( 'should keep the SDK when Angie was detected', async () => {
		// Arrange
		const ready = getAngieSdk();
		await settleDetection( { isReady: true } );

		// Act
		const wasRefreshed = refreshAngieSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getAngieSdk() ).toBe( ready );
	} );

	it( 'should keep the SDK while detection is still running', () => {
		// Arrange
		const detecting = getAngieSdk();

		// Act
		const wasRefreshed = refreshAngieSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getAngieSdk() ).toBe( detecting );
	} );

	it( 'should not fail when MCP is disabled', () => {
		// Arrange
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
		getAngieSdk();

		// Act
		const wasRefreshed = refreshAngieSdkIfDetectionExpired();

		// Assert
		expect( wasRefreshed ).toBe( false );
	} );
} );
