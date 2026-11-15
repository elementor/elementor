import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3TextControlTool } from '../tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

describe( 'initV3TextControlTool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3-text-control tool', () => {
		// Arrange
		const reg = getMCPByDomain( 'ai' );

		// Act
		initV3TextControlTool( reg );

		// Assert
		expect( mockAddTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-text-control',
				isDestructive: true,
				handler: expect.any( Function ),
			} )
		);
	} );
} );
