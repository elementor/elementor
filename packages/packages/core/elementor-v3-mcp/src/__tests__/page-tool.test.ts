import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/* eslint-disable import/no-relative-packages */
import {
	cleanupElementorMocks,
	type ElementorMockSetup,
	setupElementorMocks,
} from '../../../../libs/elementor-mcp-common/src/__tests__/test-mocks';
/* eslint-enable import/no-relative-packages */

const mockConsoleLog = jest.fn();
// eslint-disable-next-line no-console
console.log = mockConsoleLog;

describe( 'page-tool.ts - Save Changes Suggestions', () => {
	let elementorMocks: ElementorMockSetup;
	let mockRun: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockConsoleLog.mockClear();

		elementorMocks = setupElementorMocks();

		mockRun = jest.fn().mockResolvedValue( true );
		Object.defineProperty( window, '$e', {
			value: {
				run: mockRun,
			},
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		cleanupElementorMocks();
	} );

	describe( 'handleUpdateDocumentSettings', () => {
		it( 'should add saveChangesSuggestion when document settings are updated successfully', async () => {
			// Arrange
			const { addPageTool } = await import( '../tools/page-tool' );
			const mockServer = {
				registerTool: jest.fn(),
			};

			addPageTool( mockServer as unknown as McpServer );

			const toolHandler = ( mockServer.registerTool as jest.Mock ).mock.calls.find(
				( call: unknown[] ) => call[ 0 ] === 'page'
			)?.[ 2 ];

			const params = {
				action: 'update-settings',
				settings: {
					post_title: 'Updated Title',
					post_status: 'publish',
				},
			};

			// Act
			const result = await toolHandler( params );

			// Assert
			expect( result.content[ 0 ].type ).toBe( 'text' );
			const response = JSON.parse( result.content[ 0 ].text );

			expect( response.saveChangesSuggestion ).toBe(
				'Suggest the following quick user replies: "Publish Changes", "Save Draft"'
			);
			expect( response.nextStep ).toBe(
				'Page settings updated in editor. User should save the page to persist changes.'
			);
			expect( response.message ).toContain( 'Document settings updated successfully' );
		} );

		it( 'should call window.$e.run with correct parameters', async () => {
			// Arrange
			const { addPageTool } = await import( '../tools/page-tool' );
			const mockServer = {
				registerTool: jest.fn(),
			} as unknown as McpServer;

			addPageTool( mockServer );

			const toolHandler = ( mockServer.registerTool as jest.Mock ).mock.calls.find(
				( call: unknown[] ) => call[ 0 ] === 'page'
			)?.[ 2 ];

			const params = {
				action: 'update-settings',
				settings: {
					post_title: 'New Title',
				},
			};

			// Act
			await toolHandler( params );

			// Assert
			expect( mockRun ).toHaveBeenCalledWith(
				'document/elements/settings',
				expect.objectContaining( {
					container: elementorMocks.mockDocument.container,
					settings: params.settings,
					options: {
						external: true,
					},
				} )
			);
		} );

		it( 'should throw error when no settings provided', async () => {
			// Arrange
			const { addPageTool } = await import( '../tools/page-tool' );
			const mockServer = {
				registerTool: jest.fn(),
			} as unknown as McpServer;

			addPageTool( mockServer );

			const toolHandler = ( mockServer.registerTool as jest.Mock ).mock.calls.find(
				( call: unknown[] ) => call[ 0 ] === 'page'
			)?.[ 2 ];

			const params = {
				action: 'update-settings',
				settings: null,
			};

			// Act & Assert
			await expect( toolHandler( params ) ).rejects.toThrow(
				'settings object is required for update-settings action'
			);
		} );
	} );
} );
