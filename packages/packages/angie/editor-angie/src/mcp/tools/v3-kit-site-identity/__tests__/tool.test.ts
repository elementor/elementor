import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3KitSiteIdentityTool } from '../tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

describe( 'initV3KitSiteIdentityTool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3-kit-site-identity tool', () => {
		// Arrange
		const reg = getMCPByDomain( 'ai' );

		// Act
		initV3KitSiteIdentityTool( reg );

		// Assert
		expect( mockAddTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-kit-site-identity',
				isDestructive: true,
				handler: expect.any( Function ),
			} )
		);
	} );
} );
