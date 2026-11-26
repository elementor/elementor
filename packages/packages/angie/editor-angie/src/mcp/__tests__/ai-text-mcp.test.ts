import { getMCPByDomain } from '@elementor/editor-mcp';

import { initAiTextMcp } from '../ai-text-mcp';
import { initUploadMediaTool } from '../tools/upload-media/tool';
import { initV3CodeControlTool } from '../tools/v3-code-control/tool';
import { initV3KitSiteIdentityTool } from '../tools/v3-kit-site-identity/tool';
import { initV3MotionEffectsTool } from '../tools/v3-motion-effects/tool';
import { initV3TextControlTool } from '../tools/v3-text-control/tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

jest.mock( '../tools/v3-code-control/tool', () => ( {
	initV3CodeControlTool: jest.fn(),
} ) );

jest.mock( '../tools/v3-kit-site-identity/tool', () => ( {
	initV3KitSiteIdentityTool: jest.fn(),
} ) );

jest.mock( '../tools/v3-motion-effects/tool', () => ( {
	initV3MotionEffectsTool: jest.fn(),
} ) );

jest.mock( '../tools/upload-media/tool', () => ( {
	initUploadMediaTool: jest.fn(),
} ) );

jest.mock( '../tools/v3-text-control/tool', () => ( {
	initV3TextControlTool: jest.fn(),
} ) );

describe( 'initAiTextMcp', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the v3 ai tools on the ai MCP domain', () => {
		initAiTextMcp();

		expect( getMCPByDomain ).toHaveBeenCalledWith( 'ai', expect.any( Object ) );
		expect( initV3CodeControlTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
		expect( initV3KitSiteIdentityTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
		expect( initV3MotionEffectsTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
		expect( initUploadMediaTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
		expect( initV3TextControlTool ).toHaveBeenCalledWith( { addTool: mockAddTool } );
	} );
} );