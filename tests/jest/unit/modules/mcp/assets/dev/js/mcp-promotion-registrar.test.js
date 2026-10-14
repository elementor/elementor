const INJECTION_ID = 'elementor-core-mcp-upgrade';
const REGISTRAR_PATH = '../../../../../../../../modules/mcp/assets/dev/js/mcp-promotion-registrar';

jest.mock( '../../../../../../../../modules/mcp/assets/dev/js/mcp-upgrade-promotion', () => {
	const MockPromotionComponent = () => null;

	return {
		__esModule: true,
		default: MockPromotionComponent,
		MockPromotionComponent,
	};
} );
const RETRY_MS = 50;
const RETRY_TIMEOUT_MS = 5000;

describe( 'mcp-promotion-registrar', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		delete window.elementorMcpComposer;
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.resetModules();
	} );

	test( 'registers immediately when injectIntoMcpAdminPromotion is available', () => {
		const injectIntoMcpAdminPromotion = jest.fn();

		window.elementorMcpComposer = {
			injectIntoMcpAdminPromotion,
		};

		jest.isolateModules( () => {
			require( REGISTRAR_PATH );
		} );

		expect( injectIntoMcpAdminPromotion ).toHaveBeenCalledTimes( 1 );
		expect( injectIntoMcpAdminPromotion ).toHaveBeenCalledWith( {
			id: INJECTION_ID,
			component: expect.any( Function ),
		} );
	} );

	test( 'polls until injectIntoMcpAdminPromotion becomes available', () => {
		const injectIntoMcpAdminPromotion = jest.fn();

		window.elementorMcpComposer = {};

		jest.isolateModules( () => {
			require( REGISTRAR_PATH );
		} );

		expect( injectIntoMcpAdminPromotion ).not.toHaveBeenCalled();

		window.elementorMcpComposer.injectIntoMcpAdminPromotion = injectIntoMcpAdminPromotion;

		jest.advanceTimersByTime( RETRY_MS );

		expect( injectIntoMcpAdminPromotion ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'stops polling after retry timeout when composer API is missing', () => {
		window.elementorMcpComposer = {};

		jest.isolateModules( () => {
			require( REGISTRAR_PATH );
		} );

		jest.advanceTimersByTime( RETRY_TIMEOUT_MS );

		expect( jest.getTimerCount() ).toBe( 0 );

		jest.advanceTimersByTime( RETRY_TIMEOUT_MS );

		expect( window.elementorMcpComposer.injectIntoMcpAdminPromotion ).toBeUndefined();
	} );
} );
