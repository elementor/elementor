import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { type Editor } from '@tiptap/react';

import { InlineEditorToolbar } from '../inline-editor-toolbar';

const createMockEditor = ( activeFormats: string[] = [] ): Editor => {
	const mockChain = {
		focus: jest.fn().mockReturnThis(),
		clearNodes: jest.fn().mockReturnThis(),
		unsetAllMarks: jest.fn().mockReturnThis(),
		toggleBold: jest.fn().mockReturnThis(),
		toggleItalic: jest.fn().mockReturnThis(),
		toggleUnderline: jest.fn().mockReturnThis(),
		toggleStrike: jest.fn().mockReturnThis(),
		toggleSuperscript: jest.fn().mockReturnThis(),
		toggleSubscript: jest.fn().mockReturnThis(),
		run: jest.fn(),
	};

	return {
		chain: jest.fn().mockReturnValue( mockChain ),
		isActive: jest.fn( ( format: string ) => activeFormats.includes( format ) ),
		on: jest.fn(),
		off: jest.fn(),
	} as unknown as Editor;
};

describe( 'InlineEditorToolbar', () => {
	it( 'should render all toolbar buttons', () => {
		// Arrange.
		const mockEditor = createMockEditor();

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

		// Assert.
		expect( screen.getByLabelText( 'Clear' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Bold' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Italic' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Underline' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Strikethrough' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Superscript' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Subscript' ) ).toBeInTheDocument();
	} );

	it( 'should highlight active formats', () => {
		// Arrange.
		const activeFormats = [ 'bold', 'italic' ];
		const mockEditor = createMockEditor( activeFormats );

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

		const boldButton = screen.getByLabelText( 'Bold' );
		const italicButton = screen.getByLabelText( 'Italic' );
		const underlineButton = screen.getByLabelText( 'Underline' );

		// Assert.
		expect( boldButton ).toHaveClass( 'Mui-selected' );
		expect( italicButton ).toHaveClass( 'Mui-selected' );
		expect( underlineButton ).not.toHaveClass( 'Mui-selected' );
	} );

	it( 'should call editor methods when buttons are clicked', () => {
		// Arrange.
		const mockEditor = createMockEditor();
		const mockChain = mockEditor.chain();

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

		const boldButton = screen.getByLabelText( 'Bold' );
		fireEvent.click( boldButton );

		// Assert.
		expect( mockEditor.chain ).toHaveBeenCalled();
		expect( mockChain.focus ).toHaveBeenCalled();
		expect( mockChain.toggleBold ).toHaveBeenCalled();
		expect( mockChain.run ).toHaveBeenCalled();
	} );

	it( 'should call reset formatting when reset button is clicked', () => {
		// Arrange.
		const mockEditor = createMockEditor();
		const mockChain = mockEditor.chain();

		// Act.
		renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

		const resetButton = screen.getByLabelText( 'Clear' );
		fireEvent.click( resetButton );

		// Assert.
		expect( mockEditor.chain ).toHaveBeenCalled();
		expect( mockChain.focus ).toHaveBeenCalled();
		expect( mockChain.clearNodes ).toHaveBeenCalled();
		expect( mockChain.unsetAllMarks ).toHaveBeenCalled();
		expect( mockChain.run ).toHaveBeenCalled();
	} );
} );
