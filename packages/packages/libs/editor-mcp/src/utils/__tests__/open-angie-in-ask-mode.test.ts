import { openAngieInAskMode } from '../open-angie-in-ask-mode';

const mockIsAngieAvailable = jest.fn();
const mockSdkOpenAngieInAskMode = jest.fn();

jest.mock( '@elementor-external/angie-sdk', () => ( {
	openAngieInAskMode: ( ...args: unknown[] ) => mockSdkOpenAngieInAskMode( ...args ),
} ) );

jest.mock( '../is-angie-available', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

describe( 'openAngieInAskMode', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockSdkOpenAngieInAskMode.mockReset();
	} );

	it( 'does nothing when Angie is not available', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		openAngieInAskMode();

		expect( mockSdkOpenAngieInAskMode ).not.toHaveBeenCalled();
	} );

	it( 'opens Angie in ask mode when Angie is available', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode();

		expect( mockSdkOpenAngieInAskMode ).toHaveBeenCalledWith( {
			source: 'help-center',
			prompt: undefined,
		} );
	} );

	it( 'passes prompt to the SDK when provided', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		openAngieInAskMode( 'Help me with ' );

		expect( mockSdkOpenAngieInAskMode ).toHaveBeenCalledWith( {
			source: 'help-center',
			prompt: 'Help me with ',
		} );
	} );
} );
