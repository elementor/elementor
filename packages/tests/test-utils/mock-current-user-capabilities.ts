import { useCurrentUserCapabilities } from '@elementor/editor-current-user';

export const mockCurrentUserCapabilities = ( isAdmin: boolean ) => {
	jest.mocked( useCurrentUserCapabilities ).mockReturnValue( {
		isAdmin,
		canUser: jest.fn(),
		capabilities: [],
	} );
};

