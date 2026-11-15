import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3CodeControlTool } from '../tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

describe( 'initV3CodeControlTool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3-code-control tool', () => {
		// Arrange
		const reg = getMCPByDomain( 'ai' );

		// Act
		initV3CodeControlTool( reg );

		// Assert
		expect( mockAddTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-code-control',
				isDestructive: true,
				handler: expect.any( Function ),
			} )
		);
	} );
} );
