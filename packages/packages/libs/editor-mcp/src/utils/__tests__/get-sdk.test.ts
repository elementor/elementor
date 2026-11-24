import { AngieMcpSdk } from '@elementor-external/angie-sdk';

import { EDITOR_ANGIE_APP_ID, getSDK } from '../get-sdk';

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieMcpSdk: jest.fn(),
	getAngieIframe: jest.fn(),
	MessageEventType: {},
} ) );

const GLOBAL_MCP_DISABLED_FLAG = '__ELEMENTOR_MCP_DISABLED__';

describe( 'getSDK', () => {
	beforeEach( () => {
		( globalThis as Record< string, unknown > )[ GLOBAL_MCP_DISABLED_FLAG ] = false;
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
		expect( AngieMcpSdk ).toHaveBeenCalledTimes( 1 );
		expect( AngieMcpSdk ).toHaveBeenCalledWith( { appId: EDITOR_ANGIE_APP_ID } );
	} );
} );
