import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { injectIntoInlineEditorToolbarActions } from '@elementor/editor-controls';
import { getContainer, getElementSetting } from '@elementor/editor-elements';
import { screen } from '@testing-library/react';
import { type Editor } from '@tiptap/react';

import { InlineEditorToolbar } from '../inline-editor-toolbar';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	getElementSetting: jest.fn(),
} ) );

const TestAction = () => <button type="button">Generate action</button>;

const createMockEditor = (): Editor =>
	( {
		chain: jest.fn().mockReturnValue( {
			focus: jest.fn().mockReturnThis(),
			toggleBold: jest.fn().mockReturnThis(),
			run: jest.fn(),
		} ),
		isActive: jest.fn().mockReturnValue( false ),
		getAttributes: jest.fn().mockReturnValue( {} ),
		getHTML: jest.fn().mockReturnValue( '<p>Hello</p>' ),
		on: jest.fn(),
		off: jest.fn(),
	} ) as unknown as Editor;

describe( 'InlineEditorToolbar toolbar actions', () => {
	beforeEach( () => {
		jest.mocked( getContainer ).mockReturnValue( null );
		jest.mocked( getElementSetting ).mockReturnValue( null );
		injectIntoInlineEditorToolbarActions( {
			id: 'test-toolbar-action',
			component: TestAction,
			options: { overwrite: true },
		} );
	} );

	it( 'should render injected toolbar actions when bind and source are provided', () => {
		// Arrange.
		const editor = createMockEditor();

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ editor } elementId="element-1" bind="title" source="canvas" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Generate action' } ) ).toBeInTheDocument();
	} );

	it( 'should not render injected toolbar actions when bind is missing', () => {
		// Arrange.
		const editor = createMockEditor();

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ editor } elementId="element-1" source="canvas" /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Generate action' } ) ).not.toBeInTheDocument();
	} );
} );
