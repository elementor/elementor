import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';
import { type Editor } from '@tiptap/react';

import {
	injectIntoInlineEditorToolbarActions,
	type InlineEditorToolbarActionContext,
	InlineEditorToolbarActionsSlot,
} from '../inline-editor-toolbar-actions';

const TestAction = ( { bind, source }: InlineEditorToolbarActionContext ) => (
	<button type="button">{ `${ bind }-${ source }` }</button>
);

const createMockEditor = (): Editor =>
	( {
		getHTML: jest.fn().mockReturnValue( '<p>Hello</p>' ),
	} ) as unknown as Editor;

describe( 'InlineEditorToolbarActions', () => {
	beforeEach( () => {
		injectIntoInlineEditorToolbarActions( {
			id: 'test-action',
			component: TestAction,
			options: { overwrite: true },
		} );
	} );

	it( 'should render injected toolbar actions with context', () => {
		// Arrange.
		const editor = createMockEditor();
		const context: InlineEditorToolbarActionContext = {
			editor,
			elementId: 'element-1',
			bind: 'title',
			html: '<p>Hello</p>',
			source: 'panel',
		};

		// Act.
		renderWithTheme( <InlineEditorToolbarActionsSlot { ...context } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'title-panel' } ) ).toBeInTheDocument();
	} );
} );
