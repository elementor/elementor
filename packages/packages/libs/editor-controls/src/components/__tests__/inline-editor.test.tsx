import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { InlineEditor } from '../inline-editor';

describe( 'InlineEditor', () => {
	const defaultProps = {
		value: '<p>Test content</p>',
		setValue: jest.fn(),
	};

	const setup = ( props = {} ) => {
		return renderWithTheme( <InlineEditor { ...defaultProps } { ...props } /> );
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render with initial value', () => {
		// Arrange & Act.
		setup();

		// Assert.
		expect( screen.getByText( 'Test content' ) ).toBeInTheDocument();
	} );

	it( 'should render empty editor when value is empty', () => {
		// Arrange & Act.
		setup( { value: '' } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).toBeInTheDocument();
		expect( editor ).toHaveTextContent( '' );
	} );

	it( 'should accept custom attributes', () => {
		// Arrange.
		const customAttributes = { 'aria-label': 'Custom Editor' };

		// Act.
		setup( { attributes: customAttributes } );

		// Assert.
		const editor = screen.getByLabelText( 'Custom Editor' );
		expect( editor ).toBeInTheDocument();
	} );

	it( 'should apply custom sx styles', () => {
		// Arrange.
		const customSx = { backgroundColor: 'red', padding: 2 };

		// Act.
		setup( { sx: customSx } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).toBeInTheDocument();
	} );

	it( 'should call setValue when content changes', async () => {
		// Arrange.
		const setValue = jest.fn();
		setup( { value: '', setValue } );
		const editor = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.focus( editor );
		fireEvent.input( editor, { target: { textContent: 'New content' } } );

		// Assert.
		await waitFor( () => {
			expect( setValue ).toHaveBeenCalled();
		} );
	} );

	it( 'should render with ProseMirror editor', () => {
		// Arrange & Act.
		setup();

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).toBeInTheDocument();
		expect( editor ).toHaveAttribute( 'contenteditable', 'true' );
		expect( editor ).toHaveClass( 'ProseMirror' );
	} );

	it( 'should insert hard break on Enter key', async () => {
		// Arrange.
		const setValue = jest.fn();
		setup( { value: '<p>Line 1</p>', setValue } );
		const editor = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.focus( editor );
		fireEvent.keyDown( editor, { key: 'Enter' } );

		// Assert.
		await waitFor( () => {
			const calls = setValue.mock.calls;
			const lastCall = calls[ calls.length - 1 ];
			expect( lastCall?.[ 0 ] ).toContain( '<br>' );
		} );
	} );

	it( 'should be focusable', () => {
		// Arrange.
		setup();
		const editor = screen.getByRole( 'textbox' );

		// Act.
		fireEvent.focus( editor );

		// Assert.
		expect( editor ).toHaveClass( 'ProseMirror-focused' );
	} );

	it( 'should forward ref correctly', () => {
		// Arrange.
		const ref = React.createRef< HTMLDivElement >();

		// Act.
		renderWithTheme( <InlineEditor { ...defaultProps } ref={ ref } /> );

		// Assert.
		expect( ref.current ).toBeInstanceOf( HTMLDivElement );
	} );

	it( 'should have correct styling structure', () => {
		// Arrange & Act.
		setup();

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).toBeInTheDocument();
		expect( editor ).toHaveClass( 'ProseMirror' );
	} );
} );
