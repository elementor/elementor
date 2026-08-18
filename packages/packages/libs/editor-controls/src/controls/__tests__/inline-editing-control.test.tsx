import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { htmlV3PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { InlineEditingControl } from '../inline-editing-control';

const ELEMENT_ID = 'heading-el-1';
const ANGIE_TITLE_GENERATION_APP_ID = 'elementor-editor-title-generation';
const ANGIE_TITLE_GENERATION_SOURCE = 'atomic_heading_title';
const TITLE_GENERATION_MCP_SERVER_NAME = 'editor-title_generation';

const mockOpenAngieFloatingChat = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieFloatingChat: ( ...args: unknown[] ) => mockOpenAngieFloatingChat( ...args ),
} ) );

jest.mock( '../../components/inline-editor', () => ( {
	InlineEditor: ( { value }: { value: string } ) => <div data-testid="inline-editor">{ value }</div>,
} ) );

const htmlV3PropType = createMockPropType( { kind: 'plain', key: htmlV3PropTypeUtil.key } );

const defaultValue = htmlV3PropTypeUtil.create( {
	content: stringPropTypeUtil.create( 'Current heading' ),
	children: [],
} );

const renderInlineEditingControl = ( enableAngieGenerate?: boolean ) =>
	renderControl(
		<InlineEditingControl enableAngieGenerate={ enableAngieGenerate } context={ { elementId: ELEMENT_ID } } />,
		{
			bind: 'title',
			propType: htmlV3PropType,
			value: defaultValue,
		}
	);

const getExpectedPrompt = () =>
	expect.stringMatching(
		new RegExp(
			`Generate or update the heading title for element ID ${ ELEMENT_ID }\\. Current title: "Current heading"`
		)
	);

describe( 'InlineEditingControl Generate button', () => {
	beforeEach( () => {
		mockOpenAngieFloatingChat.mockReset();
		mockOpenAngieFloatingChat.mockResolvedValue( undefined );
	} );

	it( 'renders the Generate button when enableAngieGenerate is true', () => {
		// Arrange
		renderInlineEditingControl( true );

		// Act
		const generateButton = screen.getByRole( 'button', { name: 'Generate' } );

		// Assert
		expect( generateButton ).toBeInTheDocument();
	} );

	it( 'does not render the Generate button when enableAngieGenerate is false', () => {
		// Arrange
		renderInlineEditingControl( false );

		// Act
		const generateButton = screen.queryByRole( 'button', { name: 'Generate' } );

		// Assert
		expect( generateButton ).not.toBeInTheDocument();
	} );

	it( 'calls openAngieFloatingChat with the heading prompt and Angie config when Generate is clicked', () => {
		// Arrange
		renderInlineEditingControl( true );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate' } ) );

		// Assert
		expect( mockOpenAngieFloatingChat ).toHaveBeenCalledTimes( 1 );
		expect( mockOpenAngieFloatingChat ).toHaveBeenCalledWith(
			expect.objectContaining( {
				appId: ANGIE_TITLE_GENERATION_APP_ID,
				source: ANGIE_TITLE_GENERATION_SOURCE,
				prompt: getExpectedPrompt(),
				widgetConfig: expect.objectContaining( {
					featuredMcpServer: TITLE_GENERATION_MCP_SERVER_NAME,
				} ),
			} )
		);
	} );
} );
