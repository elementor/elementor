const mockGetAngieIframe = jest.fn();
const mockIsAngiePluginAvailable = jest.fn();
const mockWaitForAngiePluginActive = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	getAngieIframe: () => mockGetAngieIframe(),
	isAngiePluginAvailable: () => mockIsAngiePluginAvailable(),
	waitForAngiePluginActive: ( timeout: number ) => mockWaitForAngiePluginActive( timeout ),
} ) );

import {
	isAngieAvailable,
	isLegacyAngieAvailable,
	waitForAngieReady,
} from '../is-angie-available';

const ANGIE_PLUGIN_DETECTION_TIMEOUT_MS = 3_000;

describe( 'isAngieAvailable', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns true when the Angie plugin API is available', () => {
		mockIsAngiePluginAvailable.mockReturnValue( true );
		mockGetAngieIframe.mockReturnValue( null );

		expect( isAngieAvailable() ).toBe( true );
	} );

	it( 'returns true when only the legacy Angie iframe is present', () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( document.createElement( 'iframe' ) );

		expect( isAngieAvailable() ).toBe( true );
	} );

	it( 'returns false when neither the plugin API nor iframe is present', () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( null );

		expect( isAngieAvailable() ).toBe( false );
	} );
} );

describe( 'isLegacyAngieAvailable', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns true when the plugin API is absent but the legacy iframe is present', () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( document.createElement( 'iframe' ) );

		expect( isLegacyAngieAvailable() ).toBe( true );
	} );

	it( 'returns false when the plugin API is available', () => {
		mockIsAngiePluginAvailable.mockReturnValue( true );
		mockGetAngieIframe.mockReturnValue( document.createElement( 'iframe' ) );

		expect( isLegacyAngieAvailable() ).toBe( false );
	} );

	it( 'returns false when neither signal is present', () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( null );

		expect( isLegacyAngieAvailable() ).toBe( false );
	} );
} );

describe( 'waitForAngieReady', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'waits for the Angie plugin API when it is available', async () => {
		mockIsAngiePluginAvailable.mockReturnValue( true );
		mockWaitForAngiePluginActive.mockResolvedValue( true );

		await expect( waitForAngieReady() ).resolves.toBe( true );
		expect( mockWaitForAngiePluginActive ).toHaveBeenCalledWith( ANGIE_PLUGIN_DETECTION_TIMEOUT_MS );
	} );

	it( 'falls back to legacy iframe detection when the plugin API is absent', async () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( document.createElement( 'iframe' ) );

		await expect( waitForAngieReady() ).resolves.toBe( true );
		expect( mockWaitForAngiePluginActive ).not.toHaveBeenCalled();
	} );

	it( 'returns false when neither the plugin API nor iframe is present', async () => {
		mockIsAngiePluginAvailable.mockReturnValue( false );
		mockGetAngieIframe.mockReturnValue( null );

		await expect( waitForAngieReady() ).resolves.toBe( false );
		expect( mockWaitForAngiePluginActive ).not.toHaveBeenCalled();
	} );
} );
