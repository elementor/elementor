import { openAngieInAskMode } from '../open-angie-in-ask-mode';

const mockIsAngieAvailable = jest.fn();
const mockSetAngieInteractionMode = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	setAngieInteractionMode: ( ...args: unknown[] ) => mockSetAngieInteractionMode( ...args ),
} ) );

jest.mock( '../is-angie-available', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

describe( 'openAngieInAskMode', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockSetAngieInteractionMode.mockReset();
	} );

	it( 'does nothing when Angie is not available', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		openAngieInAskMode();

		expect( mockSetAngieInteractionMode ).not.toHaveBeenCalled();
	} );

	it( 'opens Angie in ask mode when Angie is available', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode();

		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask', {
			isOpen: true,
			source: 'help-center',
			prompt: undefined,
		} );
	} );

	it( 'passes prompt to the SDK when provided', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode( 'Help me with ' );

		expect( mockSetAngieInteractionMode ).toHaveBeenCalledWith( 'ask', {
			isOpen: true,
			source: 'help-center',
			prompt: 'Help me with ',
		} );
	} );
} );
