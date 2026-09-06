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
