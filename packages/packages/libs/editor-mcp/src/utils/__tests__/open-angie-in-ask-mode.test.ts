import { openAngieInAskMode } from '../open-angie-in-ask-mode';

const mockIsAngieAvailable = jest.fn();
const mockGetAngieIframe = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockAngieIframe = document.createElement( 'iframe' );

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieInteractionMode: {
		ASK: 'ask',
	},
	getAngieIframe: () => mockGetAngieIframe(),
	setAngieInteractionMode: ( ...args: unknown[] ) => mockSetAngieInteractionMode( ...args ),
	toggleAngieSidebar: ( ...args: unknown[] ) => mockToggleAngieSidebar( ...args ),
} ) );

jest.mock( '../is-angie-available', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

describe( 'openAngieInAskMode', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockGetAngieIframe.mockReset();
		mockToggleAngieSidebar.mockReset();
		mockSetAngieInteractionMode.mockReset();
		mockGetAngieIframe.mockReturnValue( mockAngieIframe );
		window.location.hash = '';
		delete ( window as Window & { elementorV2?: unknown } ).elementorV2;
	} );

	it( 'delegates to the loaded editor Angie package', () => {
		const openAngie = jest.fn();
		( window as Window & { elementorV2?: { editorAngie?: { openAngie: typeof openAngie } } } ).elementorV2 = {
			editorAngie: { openAngie },
		};

		openAngieInAskMode( 'Help me with ' );

		expect( openAngie ).toHaveBeenCalledWith( { prompt: 'Help me with ', mode: 'ask' } );
		expect( mockToggleAngieSidebar ).not.toHaveBeenCalled();
		expect( window.location.hash ).toBe( '' );
	} );

	it( 'logs when the loaded editor Angie package fails to open', async () => {
		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
		const openAngie = jest.fn().mockRejectedValue( new Error( 'fail' ) );
		( window as Window & { elementorV2?: { editorAngie?: { openAngie: typeof openAngie } } } ).elementorV2 = {
			editorAngie: { openAngie },
		};

		openAngieInAskMode( 'Help me with ' );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Failed to open Angie:', expect.any( Error ) );

		consoleErrorSpy.mockRestore();
	} );

	it( 'does nothing when Angie is not available', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		openAngieInAskMode();

		expect( mockGetAngieIframe ).not.toHaveBeenCalled();
		expect( mockToggleAngieSidebar ).not.toHaveBeenCalled();
		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
	} );

	it( 'does nothing when Angie iframe is not found', () => {
		mockIsAngieAvailable.mockReturnValue( true );
		mockGetAngieIframe.mockReturnValue( null );

		openAngieInAskMode();

		expect( mockToggleAngieSidebar ).not.toHaveBeenCalled();
		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
	} );

	it( 'opens Angie in ask mode when Angie is available', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode();

		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( mockAngieIframe, true );
		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( window.location.hash ).toBe( '' );
	} );

	it( 'sets angie-prompt hash when prompt is provided', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode( 'Help me with ' );

		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask' );
		expect( window.location.hash ).toBe( '#angie-prompt=Help%20me%20with%20' );
	} );
} );
