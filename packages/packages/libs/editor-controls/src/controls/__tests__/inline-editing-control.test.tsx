import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { htmlV3PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { InlineEditingControl } from '../inline-editing-control';

const ELEMENT_ID = 'heading-el-1';
const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const ANGIE_TITLE_GENERATION_ENTRY_POINT = 'atomic_heading_title';

const mockIsAngieAvailable = jest.fn();
const mockSendPromptToAngie = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
	sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
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
		mockIsAngieAvailable.mockReset();
		mockSendPromptToAngie.mockReset();
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

	it( 'calls sendPromptToAngie with the heading prompt when Angie is available', () => {
		// Arrange
		mockIsAngieAvailable.mockReturnValue( true );
		renderInlineEditingControl( true );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate' } ) );

		// Assert
		expect( mockSendPromptToAngie ).toHaveBeenCalledTimes( 1 );
		expect( mockSendPromptToAngie ).toHaveBeenCalledWith( getExpectedPrompt() );
	} );

	it( 'dispatches create-widget event when Angie is not available', () => {
		// Arrange
		mockIsAngieAvailable.mockReturnValue( false );
		const handler = jest.fn();
		window.addEventListener( CREATE_WIDGET_EVENT, handler );
		renderInlineEditingControl( true );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate' } ) );

		// Assert
		expect( mockSendPromptToAngie ).not.toHaveBeenCalled();
		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			detail: {
				entry_point: ANGIE_TITLE_GENERATION_ENTRY_POINT,
				prompt: getExpectedPrompt(),
			},
		} );

		window.removeEventListener( CREATE_WIDGET_EVENT, handler );
	} );
} );
