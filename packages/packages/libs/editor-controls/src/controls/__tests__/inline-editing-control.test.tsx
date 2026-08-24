import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { type Editor } from '@tiptap/react';

import { InlineEditor } from '../../components/inline-editor';
import { InlineEditorToolbar } from '../../components/inline-editor-toolbar';
import { InlineEditingControl } from '../inline-editing-control';

jest.mock( '../../components/inline-editor', () => ( {
	InlineEditor: jest.fn(),
} ) );

jest.mock( '../../components/inline-editor-toolbar', () => ( {
	InlineEditorToolbar: jest.fn( () => <div data-testid="toolbar" /> ),
} ) );

const propType = createMockPropType( { kind: 'plain' } );

const createMockEditor = ( isEditable = true ): Editor => ( { isEditable } as unknown as Editor );

type InlineEditorMockProps = {
	value: string | null;
	setValue: ( value: string | null ) => void;
	placeholder?: string | null;
	onEditorCreate?: ( editor: Editor | null ) => void;
};

describe( '<InlineEditingControl />', () => {
	beforeEach( () => {
		jest.mocked( InlineEditor ).mockImplementation( ( ( {
			value,
			placeholder,
			onEditorCreate,
		}: InlineEditorMockProps ) => (
			<div data-testid="inline-editor" data-value={ value ?? '' } data-placeholder={ placeholder ?? '' }>
				<button onClick={ () => onEditorCreate?.( createMockEditor( true ) ) }>create-editable-editor</button>
				<button onClick={ () => onEditorCreate?.( createMockEditor( false ) ) }>
					create-non-editable-editor
				</button>
			</div>
		) ) as unknown as typeof InlineEditor );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const baseProps = {
		bind: 'title',
		setValue: jest.fn(),
		propType,
		value: { $$type: 'escaped-html', value: '<p>Hello</p>' },
	};

	it( 'should render the inline editor with the extracted content', () => {
		// Act.
		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, baseProps );

		// Assert.
		expect( screen.getByTestId( 'inline-editor' ) ).toHaveAttribute( 'data-value', '<p>Hello</p>' );
	} );

	it( 'should pass the placeholder down to the inline editor', () => {
		// Act.
		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, {
			...baseProps,
			value: { $$type: 'escaped-html', value: null },
			placeholder: { $$type: 'escaped-html', value: 'Type your title here' },
		} );

		// Assert.
		expect( screen.getByTestId( 'inline-editor' ) ).toHaveAttribute( 'data-placeholder', 'Type your title here' );
	} );

	it( 'should call setValue with the updated html when the editor content changes', () => {
		// Arrange.
		const setValue = jest.fn();

		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, { ...baseProps, setValue } );

		const { setValue: onEditorChange } = jest.mocked( InlineEditor ).mock.calls[ 0 ][ 0 ] as InlineEditorMockProps;

		// Act.
		onEditorChange( '<p>New content</p>' );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'escaped-html',
			value: '<p>New content</p>',
		} );
	} );

	it( 'should not render the toolbar before the editor instance is created', () => {
		// Act.
		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, baseProps );

		// Assert.
		expect( screen.queryByTestId( 'toolbar' ) ).not.toBeInTheDocument();
		expect( InlineEditorToolbar ).not.toHaveBeenCalled();
	} );

	it( 'should render the toolbar once the editor instance is created and editable', () => {
		// Arrange.
		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, baseProps );

		// Act.
		fireEvent.click( screen.getByText( 'create-editable-editor' ) );

		// Assert.
		expect( screen.getByTestId( 'toolbar' ) ).toBeInTheDocument();
		expect( InlineEditorToolbar ).toHaveBeenCalledWith(
			expect.objectContaining( {
				elementId: '1',
				inControlPanel: true,
			} ),
			expect.anything()
		);
	} );

	it( 'should not render the toolbar when the created editor instance is not editable', () => {
		// Arrange.
		renderControl( <InlineEditingControl context={ { elementId: '1' } } />, baseProps );

		// Act.
		fireEvent.click( screen.getByText( 'create-non-editable-editor' ) );

		// Assert.
		expect( screen.queryByTestId( 'toolbar' ) ).not.toBeInTheDocument();
	} );

	it( 'should pass the current elementId from context down to the toolbar', () => {
		// Arrange.
		renderControl( <InlineEditingControl context={ { elementId: 'element-42' } } />, baseProps );

		// Act.
		fireEvent.click( screen.getByText( 'create-editable-editor' ) );

		// Assert.
		expect( InlineEditorToolbar ).toHaveBeenCalledWith(
			expect.objectContaining( { elementId: 'element-42' } ),
			expect.anything()
		);
	} );

	it( 'should render without crashing when context is not provided', () => {
		// Act.
		renderControl( <InlineEditingControl />, baseProps );
		fireEvent.click( screen.getByText( 'create-editable-editor' ) );

		// Assert.
		expect( InlineEditorToolbar ).toHaveBeenCalledWith(
			expect.objectContaining( { elementId: undefined } ),
			expect.anything()
		);
	} );
} );
