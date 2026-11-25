import { EDITOR_ANGIE_APP_ID, getAngieSdk, resetAngieSdkForTests } from '../get-sdk';

const mockConstructor = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: class {
		constructor( ...args: unknown[] ) {
			mockConstructor( ...args );
		}
	},
} ) );

const GLOBAL_MCP_DISABLED_FLAG = '__ELEMENTOR_MCP_DISABLED__';

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
