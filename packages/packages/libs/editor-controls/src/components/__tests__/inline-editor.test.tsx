import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

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

	it( 'should render formatted content with bold / italic / strike / underline', () => {
		// Arrange & Act.
		const formattedValue = '<strong>Bold</strong> <em>Italic</em> <s>Strike</s> <u>Underline</u>';
		setup( { value: formattedValue } );

		// Assert.
		expect( screen.getByText( 'Bold' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Italic' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Strike' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Underline' ) ).toBeInTheDocument();
	} );

	it( 'should keep content inline without block elements', () => {
		// Arrange & Act.
		const inlineValue = 'Line 1<br>Line 2';
		setup( { value: inlineValue } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor.innerHTML ).toContain( '<br>' );
		expect( editor.innerHTML ).not.toContain( '<p>' );
		expect( editor.innerHTML ).not.toContain( '</p>' );
	} );

	it( 'should apply elementClasses to rendered elements', () => {
		// Arrange & Act.
		const elementClasses = 'custom-padding custom-margin';
		setup( { value: '<p>Test</p>', elementClasses, expectedTag: 'p' } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		const paragraph = within( editor ).getByText( 'Test' );
		expect( paragraph ).toHaveClass( 'custom-padding' );
		expect( paragraph ).toHaveClass( 'custom-margin' );
	} );

	it.each( [
		[ null, true ],
		[ '', true ],
		[ 'Some content', false ],
	] )( 'should toggle is-empty class based on value (%s)', ( value, shouldBeEmpty ) => {
		// Arrange & Act.
		setup( { value } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );

		if ( shouldBeEmpty ) {
			expect( editor ).toHaveClass( 'is-empty' );
		} else {
			expect( editor ).not.toHaveClass( 'is-empty' );
		}
	} );

	it.each( [
		[ 'Enter text here', 'Enter text here' ],
		[ 'hello<br>world', 'hello\nworld' ],
		[ '<strong>Bold</strong> text', 'Bold text' ],
	] )( 'should convert placeholder HTML to plain text (%s)', ( placeholder, expected ) => {
		// Arrange & Act.
		setup( { value: null, placeholder } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).toHaveAttribute( 'data-placeholder', expected );
	} );

	it( 'should not set data-placeholder when placeholder is null', () => {
		// Arrange & Act.
		setup( { value: null, placeholder: null } );

		// Assert.
		const editor = screen.getByRole( 'textbox' );
		expect( editor ).not.toHaveAttribute( 'data-placeholder' );
	} );
} );
