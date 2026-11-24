import { EDITOR_ANGIE_APP_ID, getSDK, resetSdkIfDetectionExpired } from '../get-sdk';

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

describe( 'getSDK', () => {
	beforeEach( async () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
		getSDK();
		await settleDetection( { isReady: false } );
		resetSdkIfDetectionExpired();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should create a single SDK instance bound to the editor app id', () => {
		// Act
		const first = getSDK();
		const second = getSDK();

		// Assert
		expect( second ).toBe( first );
		expect( mockConstructor ).toHaveBeenCalledTimes( 1 );
		expect( mockConstructor ).toHaveBeenCalledWith( { appId: EDITOR_ANGIE_APP_ID } );
	} );
} );

describe( 'resetSdkIfDetectionExpired', () => {
	beforeEach( async () => {
		jest.clearAllMocks();
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
		getSDK();
		await settleDetection( { isReady: false } );
		resetSdkIfDetectionExpired();
		jest.clearAllMocks();
	} );

	afterEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;
	} );

	it( 'should replace the SDK when Angie detection gave up', async () => {
		// Arrange
		const expired = getSDK();
		await settleDetection( { isReady: false } );

		// Act
		const wasReset = resetSdkIfDetectionExpired();

		// Assert
		expect( wasReset ).toBe( true );
		expect( mockDestroy ).toHaveBeenCalledTimes( 1 );
		expect( getSDK() ).not.toBe( expired );
	} );

	it( 'should keep the SDK when Angie was detected', async () => {
		// Arrange
		const ready = getSDK();
		await settleDetection( { isReady: true } );

		// Act
		const wasReset = resetSdkIfDetectionExpired();

		// Assert
		expect( wasReset ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getSDK() ).toBe( ready );
	} );

	it( 'should keep the SDK while detection is still running', () => {
		// Arrange
		const detecting = getSDK();

		// Act
		const wasReset = resetSdkIfDetectionExpired();

		// Assert
		expect( wasReset ).toBe( false );
		expect( mockDestroy ).not.toHaveBeenCalled();
		expect( getSDK() ).toBe( detecting );
	} );

	it( 'should not fail when MCP is disabled', () => {
		// Arrange
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = true;

		// Act
		const wasReset = resetSdkIfDetectionExpired();

		// Assert
		expect( wasReset ).toBe( false );
	} );
} );
