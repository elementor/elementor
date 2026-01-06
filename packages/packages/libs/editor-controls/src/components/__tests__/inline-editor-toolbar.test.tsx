import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { type Editor } from '@tiptap/react';
import { getElementSetting } from '@elementor/editor-elements';

import { InlineEditorToolbar } from '../inline-editor-toolbar';

jest.mock( '@elementor/editor-elements', () => ( {
	getElementSetting: jest.fn(),
} ) );

type MockEditorOptions = {
	activeFormats?: string[];
	linkAttributes?: { href?: string; target?: string };
};

const createMockEditor = ( options: MockEditorOptions = {} ): Editor => {
	const { activeFormats = [], linkAttributes = {} } = options;

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
		setLink: jest.fn().mockReturnThis(),
		unsetLink: jest.fn().mockReturnThis(),
		run: jest.fn(),
	};

	return {
		chain: jest.fn().mockReturnValue( mockChain ),
		isActive: jest.fn( ( format: string ) => activeFormats.includes( format ) ),
		getAttributes: jest.fn( () => linkAttributes ),
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
		expect( screen.getByLabelText( 'Link' ) ).toBeInTheDocument();
	} );

	it( 'should highlight active formats', () => {
		// Arrange.
		const mockEditor = createMockEditor( { activeFormats: [ 'bold', 'italic' ] } );

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

	describe( 'Link functionality', () => {
		it( 'should open URL popover when clicking link button', () => {
			// Arrange.
			const mockEditor = createMockEditor();

			// Act.
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

			const linkButton = screen.getByLabelText( 'Link' );
			fireEvent.click( linkButton );

			// Assert.
			expect( screen.getByPlaceholderText( 'Type a URL' ) ).toBeInTheDocument();
		} );

		it( 'should call setLink with target="_blank" when openInNewTab is enabled', () => {
			// Arrange.
			const mockEditor = createMockEditor();
			const mockChain = mockEditor.chain();

			// Act.
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

			const linkButton = screen.getByLabelText( 'Link' );
			fireEvent.click( linkButton );

			const urlInput = screen.getByPlaceholderText( 'Type a URL' );
			fireEvent.change( urlInput, { target: { value: 'https://elementor.com' } } );

			const newTabButton = screen.getByLabelText( 'Open in a new tab' );
			fireEvent.click( newTabButton );

			fireEvent.keyDown( urlInput, { key: 'Escape' } );

			// Assert.
			expect( mockChain.setLink ).toHaveBeenCalledWith( {
				href: 'https://elementor.com',
				target: '_blank',
			} );
		} );

		it( 'should call unsetLink when URL is empty', () => {
			// Arrange.
			const mockEditor = createMockEditor( { linkAttributes: { href: 'https://old-url.com' } } );
			const mockChain = mockEditor.chain();

			// Act.
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

			const linkButton = screen.getByLabelText( 'Link' );
			fireEvent.click( linkButton );

			const urlInput = screen.getByPlaceholderText( 'Type a URL' );
			fireEvent.change( urlInput, { target: { value: '' } } );

			fireEvent.keyDown( urlInput, { key: 'Escape' } );

			// Assert.
			expect( mockChain.unsetLink ).toHaveBeenCalled();
		} );

		it( 'should initialize openInNewTab state from existing link attributes', () => {
			// Arrange.
			const mockEditor = createMockEditor( {
				linkAttributes: { href: 'https://elementor.com', target: '_blank' },
			} );

			// Act.
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } /> );

			const linkButton = screen.getByLabelText( 'Link' );
			fireEvent.click( linkButton );

			const newTabButton = screen.getByLabelText( 'Open in a new tab' );

			// Assert.
			expect( newTabButton ).toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );

	describe( 'Link button visibility based on LinkControl', () => {
		const ELEMENT_ID = 'test-element-123';

		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should hide link button when element has LinkControl link', () => {
			// Arrange
			const mockEditor = createMockEditor();
			
			jest.mocked( getElementSetting ).mockReturnValue( {
				value: {
					destination: 'https://example.com',
				},
			} );

			// Act
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } elementId={ ELEMENT_ID } /> );

			// Assert
			expect( screen.queryByLabelText( 'Link' ) ).not.toBeInTheDocument();
		} );

		it( 'should show link button when element has no LinkControl link', () => {
			// Arrange
			const mockEditor = createMockEditor();
			
			jest.mocked( getElementSetting ).mockReturnValue( null );

			// Act
			renderWithTheme( <InlineEditorToolbar editor={ mockEditor } elementId={ ELEMENT_ID } /> );

			// Assert
			expect( screen.getByLabelText( 'Link' ) ).toBeInTheDocument();
		} );
	} );
} );
