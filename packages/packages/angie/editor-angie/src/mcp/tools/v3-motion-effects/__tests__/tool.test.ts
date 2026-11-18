import { getMCPByDomain } from '@elementor/editor-mcp';

import { initV3MotionEffectsTool } from '../tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

describe( 'initV3MotionEffectsTool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3-motion-effects tool', () => {
		// Arrange
		const reg = getMCPByDomain( 'ai' );

		// Act
		initV3MotionEffectsTool( reg );

		// Assert
		expect( mockAddTool ).toHaveBeenCalledWith(
			expect.objectContaining( {
				name: 'v3-motion-effects',
				isDestructive: true,
				handler: expect.any( Function ),
			} )
		);
	} );
} );
