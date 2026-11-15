import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3LayoutInsertTool } from '../tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

describe( 'initV3LayoutInsertTool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers v3-layout-insert on the MCP registry', () => {
		// Arrange
		const reg = getMCPByDomain( 'ai' );

		// Act
		initV3LayoutInsertTool( reg );

		// Assert
		expect( mockAddTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-layout-insert',
				isDestructive: true,
				handler: expect.any( Function ),
			} )
		);
	} );
} );
