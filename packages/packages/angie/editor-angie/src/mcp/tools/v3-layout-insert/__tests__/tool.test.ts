import { initV3LayoutInsertTool } from '../tool';

describe( 'initV3LayoutInsertTool', () => {
	it( 'registers v3-layout-insert on the MCP registry', () => {
		// Arrange
		const addTool = jest.fn();
		const reg = { addTool };

		// Act
		initV3LayoutInsertTool( reg );

		// Assert
		expect( addTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-layout-insert',
				isDestructive: true,
			} )
		);
	} );
} );
