import { openAngieInAskMode } from '../open-angie-in-ask-mode';

const mockIsAngieAvailable = jest.fn();
const mockNavigateAngieIframe = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	navigateAngieIframe: ( ...args: unknown[] ) => mockNavigateAngieIframe( ...args ),
} ) );

jest.mock( '../is-angie-available', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

describe( 'openAngieInAskMode', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockNavigateAngieIframe.mockReset();
		window.location.hash = '';
	} );

	it( 'does nothing when Angie is not available', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		openAngieInAskMode();

		expect( mockNavigateAngieIframe ).not.toHaveBeenCalled();
	} );

	it( 'opens Angie in ask mode when Angie is available', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode();

		expect( mockNavigateAngieIframe ).toHaveBeenCalledWith( 'ask', {
			isOpen: true,
			isStudioOpen: false,
			source: 'help-center',
		} );
	} );

	it( 'prefills the Angie prompt when a prompt is provided', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode( 'Help me with ' );

		expect( window.location.hash ).toBe( '#angie-prompt=Help%20me%20with%20' );
	} );
} );
