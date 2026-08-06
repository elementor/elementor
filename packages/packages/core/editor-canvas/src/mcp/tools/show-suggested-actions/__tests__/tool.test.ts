import { McpAppDisplayMode } from '@elementor/editor-mcp';
import { httpService } from '@elementor/http-client';

import { SUGGESTED_ACTIONS_URI } from '../../../resources/suggested-actions-resource';
import { initShowSuggestedActionsTool } from '../tool';

jest.mock( '@elementor/editor-mcp', () => ( {
	McpAppDisplayMode: jest.requireActual( '@elementor/editor-mcp' ).McpAppDisplayMode,
} ) );

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

type Handler = ( params: {
	actions: Array< { label: string; prompt: string; icon?: string } >;
} ) => Promise< { actions: Array< { label: string; prompt: string; icon?: string } > } >;

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

const getRegistration = () => {
	const addTool = jest.fn();
	initShowSuggestedActionsTool( { addTool, resource: jest.fn() } as never );
	return addTool.mock.calls[ 0 ][ 0 ];
};

describe( 'show-suggested-actions tool', () => {
	let httpMock: { post: jest.Mock };

	beforeEach( () => {
		httpMock = {
			post: jest.fn().mockResolvedValue( {
				data: {
					data: {
						actions: [
							{ label: 'Add heading', prompt: 'Add a heading to this section', icon: 'sparkles' },
							{ label: 'Change layout', prompt: 'Suggest a better layout', icon: 'grid' },
						],
					},
				},
			} ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
	} );

	it( 'registers with MCP Apps ui metadata', () => {
		// Act
		const registration = getRegistration();

		// Assert
		expect( registration.name ).toBe( 'show-suggested-actions' );
		expect( registration.ui ).toEqual( {
			resourceUri: SUGGESTED_ACTIONS_URI,
			displayMode: McpAppDisplayMode.Inline,
		} );
	} );

	it( 'handler proxies actions through the MCP proxy', async () => {
		// Arrange
		const registration = getRegistration();
		const actions = [
			{ label: 'Add heading', prompt: 'Add a heading to this section', icon: 'sparkles' as const },
			{ label: 'Change layout', prompt: 'Suggest a better layout', icon: 'grid' as const },
		];

		// Act
		const result = await ( registration.handler as Handler )( { actions } );

		// Assert
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'show-suggested-actions',
			input: { actions },
		} );
		expect( result ).toEqual( { actions } );
	} );
} );
