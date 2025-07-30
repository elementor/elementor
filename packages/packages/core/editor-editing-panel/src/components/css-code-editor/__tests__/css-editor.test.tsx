import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { constrainedEditor } from 'constrained-editor-plugin';
import type { editor, MonacoEditor } from 'monaco-types';

import { CssEditor } from '../css-editor';

// Mock the constrained editor plugin
jest.mock( 'constrained-editor-plugin', () => ( {
	constrainedEditor: jest.fn( () => ( {
		initializeIn: jest.fn(),
		addRestrictionsTo: jest.fn(),
	} ) ),
} ) );

// Mock document methods
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty( document, 'addEventListener', {
	value: mockAddEventListener,
	writable: true,
} );

Object.defineProperty( document, 'removeEventListener', {
	value: mockRemoveEventListener,
	writable: true,
} );

// Mock Monaco Editor
const mockEditor = {
	getModel: jest.fn( () => ( {
		getValue: jest.fn( () => 'element.style {\n  color: red;\n}' ),
		getLineCount: jest.fn( () => 3 ),
		getLineMaxColumn: jest.fn( () => 10 ),
		getPositionAt: jest.fn( () => ( { lineNumber: 2, column: 1 } ) ),
		getLineContent: jest.fn( () => 'element.style {' ),
		uri: { toString: () => 'test-uri' },
	} ) ),
	onDidChangeModelContent: jest.fn( ( callback ) => {
		// Simulate content change
		setTimeout( () => callback(), 100 );
	} ),
	layout: jest.fn(),
} as unknown as editor.IStandaloneCodeEditor;

const mockMonaco = {
	MarkerSeverity: {
		Error: 8,
	},
	editor: {
		setModelMarkers: jest.fn(),
		getModelMarkers: jest.fn( () => [] ),
	},
} as unknown as MonacoEditor;

jest.mock( '@monaco-editor/react', () => ( {
	Editor: jest.fn( ( { onMount, defaultValue, options } ) => {
		React.useEffect( () => {
			onMount( mockEditor, mockMonaco );
		}, [] );

		return (
			<div data-testid="monaco-editor">
				<textarea
					data-testid="editor-textarea"
					defaultValue={ defaultValue }
					readOnly
				/>
			</div>
		);
	} ),
} ) );

describe( 'CssEditor', () => {
	const defaultProps = {
		value: 'color: red;',
		onChange: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should render the editor with correct props', () => {
		// Act
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Assert
		expect( screen.getByTestId( 'monaco-editor' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'editor-textarea' ) ).toBeInTheDocument();
	} );

	it( 'should initialize constrained editor on mount', async () => {
		// Act
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Assert
		await waitFor( () => {
			expect( constrainedEditor ).toHaveBeenCalledWith( mockMonaco );
		} );
	} );

	it( 'should call onChange with unwrapped value when content changes', async () => {
		// Arrange
		const onChange = jest.fn();
		renderWithTheme( <CssEditor value="color: blue;" onChange={ onChange } /> );

		// Act - simulate content change
		await waitFor( () => {
			expect( mockEditor.onDidChangeModelContent ).toHaveBeenCalled();
		} );

		// Wait for debounce
		await waitFor( () => {
			expect( onChange ).toHaveBeenCalledWith( 'color: red;' );
		}, { timeout: 500 } );
	} );

	it( 'should handle resize functionality', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		const editorWrapper = screen.getByTestId( 'monaco-editor' ).parentElement;
		const resizeHandle = editorWrapper?.querySelector( 'div:last-child' );

		// Mock getBoundingClientRect
		const mockRect = {
			top: 100,
			left: 0,
			right: 400,
			bottom: 300,
			width: 400,
			height: 200,
		};

		Object.defineProperty( HTMLElement.prototype, 'getBoundingClientRect', {
			value: () => mockRect,
		} );

		// Act
		if ( resizeHandle ) {
			fireEvent.mouseDown( resizeHandle );
		}

		// Assert
		expect( mockAddEventListener ).toHaveBeenCalledWith( 'mousemove', expect.any( Function ) );
		expect( mockAddEventListener ).toHaveBeenCalledWith( 'mouseup', expect.any( Function ) );
	} );

	it( 'should clean up event listeners on unmount', () => {
		// Arrange
		const { unmount } = renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Act
		unmount();

		// Assert
		expect( mockRemoveEventListener ).toHaveBeenCalledWith( 'mousemove', expect.any( Function ) );
		expect( mockRemoveEventListener ).toHaveBeenCalledWith( 'mouseup', expect.any( Function ) );
	} );

	it( 'should handle empty value correctly', () => {
		// Arrange
		renderWithTheme( <CssEditor value="" onChange={ jest.fn() } /> );

		// Assert
		expect( screen.getByTestId( 'editor-textarea' ) ).toHaveValue( 'element.style {\n  \n}' );
	} );

	it( 'should handle multiline CSS correctly', () => {
		// Arrange
		const multilineCss = 'color: red;\nbackground: blue;\nfont-size: 16px;';
		renderWithTheme( <CssEditor value={ multilineCss } onChange={ jest.fn() } /> );

		// Assert
		expect( screen.getByTestId( 'editor-textarea' ) ).toHaveValue(
			'element.style {\n  color: red;\n  background: blue;\n  font-size: 16px;\n}'
		);
	} );
} );
