const mockIsAngiePluginAvailable = jest.fn();
const mockSuperWaitForReady = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: class {
		public waitForReady() {
			return mockSuperWaitForReady();
		}
	},
	isAngiePluginAvailable: () => mockIsAngiePluginAvailable(),
	getAngieIframe: jest.fn(),
	MessageEventType: {},
} ) );

const LEGACY_ANGIE_WAIT_RETRY_COUNT = 3;
const LEGACY_ANGIE_WAIT_RETRY_DELAY_MS = 10_000;

const loadGetSdk = () => {
	jest.resetModules();
	return require( '../get-sdk' ) as typeof import('../get-sdk');
};

describe( 'getSDK', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockIsAngiePluginAvailable.mockReturnValue( false );
		( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__ = false;
	} );

	afterEach( () => {
		jest.useRealTimers();
		( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__ = true;
	} );

	it( 'uses the standard SDK when the Angie plugin API is available', () => {
		mockIsAngiePluginAvailable.mockReturnValue( true );
		const { getSDK } = loadGetSdk();
		const sdk = getSDK();

		sdk.waitForReady();

		expect( mockSuperWaitForReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'rejects legacy SDK readiness wait after retries are exhausted', async () => {
		mockSuperWaitForReady.mockRejectedValue( new Error( 'not ready' ) );
		const { getSDK } = loadGetSdk();
		const sdk = getSDK();

		const readyPromise = sdk.waitForReady();
		const assertion = expect( readyPromise ).rejects.toThrow( 'Angie SDK failed to become ready after retries' );

		await jest.runAllTimersAsync();
		await assertion;

		expect( mockSuperWaitForReady ).toHaveBeenCalledTimes( LEGACY_ANGIE_WAIT_RETRY_COUNT );
	} );
} );
