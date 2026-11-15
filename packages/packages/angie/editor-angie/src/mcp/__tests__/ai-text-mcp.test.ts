import { getMCPByDomain } from '@elementor/editor-mcp';

import { initAiTextMcp } from '../ai-text-mcp';
import { initV3TextControlTool } from '../tools/v3-text-control/tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

jest.mock( '../tools/v3-text-control/tool', () => ( {
	initV3TextControlTool: jest.fn(),
} ) );

describe( 'initAiTextMcp', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3-text-control tool on the ai MCP domain', () => {
		// Act
		initAiTextMcp();

		// Assert
		expect( getMCPByDomain ).toHaveBeenCalledWith( 'ai', expect.any( Object ) );
		expect( initV3TextControlTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
	} );
} );
