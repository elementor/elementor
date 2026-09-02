const mockRegisterTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	McpServer: jest.fn().mockImplementation( () => ( {
		registerTool: mockRegisterTool,
	} ) ),
} ) );

jest.mock( '../apply-inline-text-value', () => ( {
	applyInlineTextValue: jest.fn(),
} ) );

import { setActiveInlineTarget } from '../active-inline-target';
import { applyInlineTextValue } from '../apply-inline-text-value';
import { createInlineTextGeneratorMcpServer } from '../create-inline-text-generator-mcp-server';

const getToolHandler = ( toolName: string ) =>
	mockRegisterTool.mock.calls.find( ( call: unknown[] ) => call[ 0 ] === toolName )?.[ 2 ];

describe( 'createInlineTextGeneratorMcpServer', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should pass the active inline target to applyInlineTextValue', async () => {
		// Arrange.
		setActiveInlineTarget( {
			elementId: 'element-1',
			bind: 'title',
			html: '<p>Current</p>',
			source: 'panel',
		} );
		createInlineTextGeneratorMcpServer();
		const applyHandler = getToolHandler( 'apply_generated_inline_text' );

		// Act.
		await applyHandler( { html: '<p>Generated</p>' } );

		// Assert.
		expect( applyInlineTextValue ).toHaveBeenCalledWith( 'element-1', 'title', '<p>Generated</p>' );
	} );

	it( 'should return the active inline target from get_active_inline_text', async () => {
		// Arrange.
		setActiveInlineTarget( {
			elementId: 'element-2',
			bind: 'paragraph',
			html: '<p>Canvas</p>',
			source: 'canvas',
		} );
		createInlineTextGeneratorMcpServer();
		const getHandler = getToolHandler( 'get_active_inline_text' );

		// Act.
		const result = await getHandler();

		// Assert.
		expect( JSON.parse( result.content[ 0 ].text ) ).toEqual( {
			elementId: 'element-2',
			bind: 'paragraph',
			html: '<p>Canvas</p>',
			source: 'canvas',
		} );
	} );
} );
