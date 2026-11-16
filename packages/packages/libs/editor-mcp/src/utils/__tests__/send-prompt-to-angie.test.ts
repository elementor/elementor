import { sendPromptToAngie } from '../send-prompt-to-angie';

const mockGetAngieIframe = jest.fn();
const mockToggleAngieSidebar = jest.fn();
const mockSetAngieInteractionMode = jest.fn();
const mockAngieIframe = document.createElement( 'iframe' );

jest.mock( '@elementor-external/angie-sdk', () => ( {
	AngieInteractionMode: {
		AGENT: 'agent',
		ASK: 'ask',
	},
	getAngieIframe: () => mockGetAngieIframe(),
	setAngieInteractionMode: ( ...args: unknown[] ) => mockSetAngieInteractionMode( ...args ),
	toggleAngieSidebar: ( ...args: unknown[] ) => mockToggleAngieSidebar( ...args ),
} ) );

describe( 'sendPromptToAngie', () => {
	beforeEach( () => {
		mockGetAngieIframe.mockReset();
		mockToggleAngieSidebar.mockReset();
		mockSetAngieInteractionMode.mockReset();
		mockGetAngieIframe.mockReturnValue( mockAngieIframe );
		window.location.hash = '';
		delete ( window as Window & { elementorV2?: unknown } ).elementorV2;
	} );

	it( 'opens the loaded editor Angie package in agent mode', () => {
		// Arrange.
		const openAngie = jest.fn();
		( window as Window & { elementorV2?: { editorAngie?: { openAngie: typeof openAngie } } } ).elementorV2 = {
			editorAngie: { openAngie },
		};

		// Act.
		sendPromptToAngie( 'Create a pricing widget' );

		// Assert.
		expect( openAngie ).toHaveBeenCalledWith( { prompt: 'Create a pricing widget', mode: 'agent' } );
		expect( mockToggleAngieSidebar ).not.toHaveBeenCalled();
		expect( window.location.hash ).toBe( '' );
	} );

	it( 'opens the Angie sidebar without changing its mode when editor Angie is not loaded', () => {
		// Act.
		sendPromptToAngie( 'Create a pricing widget' );

		// Assert.
		expect( mockToggleAngieSidebar ).toHaveBeenCalledWith( mockAngieIframe, true );
		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
		expect( window.location.hash ).toBe( '#angie-prompt=Create%20a%20pricing%20widget' );
	} );
} );
