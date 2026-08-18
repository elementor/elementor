import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { htmlV3PropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { InlineEditingControl } from '../inline-editing-control';

const ELEMENT_ID = 'heading-el-1';
const mockSendPromptToAngie = jest.fn();
const mockTriggerAngie = jest.fn().mockResolvedValue( undefined );

jest.mock( '@elementor/editor-mcp', () => ( {
	getAngieSdk: () => ( {
		triggerAngie: mockTriggerAngie,
	} ),
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

describe( 'InlineEditingControl Generate button', () => {
	beforeEach( () => {
		mockSendPromptToAngie.mockClear();
		mockTriggerAngie.mockClear();
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

	it( 'calls Angie SDK triggerAngie with prompt and context when Generate is clicked', () => {
		// Arrange
		renderInlineEditingControl( true );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate' } ) );

		// Assert
		expect( mockSendPromptToAngie ).toHaveBeenCalledTimes( 1 );
		expect( mockTriggerAngie ).toHaveBeenCalledWith( {
			prompt: expect.stringContaining( ELEMENT_ID ),
			context: { source: 'atomic-heading-title-control' },
		} );
		expect( mockTriggerAngie.mock.calls[ 0 ][ 0 ].prompt ).toContain( 'Current heading' );
	} );

	it( 'does not create an unhandled rejection when triggerAngie rejects', async () => {
		// Arrange
		mockTriggerAngie.mockRejectedValueOnce( new Error( 'Angie unavailable' ) );
		renderInlineEditingControl( true );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate' } ) );

		// Assert
		const triggerPromise = mockTriggerAngie.mock.results[ 0 ].value as Promise< unknown >;
		await expect( triggerPromise.catch( () => undefined ) ).resolves.toBeUndefined();
	} );
} );
