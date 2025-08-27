import * as React from 'react';
import type { editor, MonacoEditor } from 'monaco-types';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { CssEditor } from '../css-editor';

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

const mockOnKeyDown = jest.fn();
const mockGetPosition = jest.fn( () => ( { lineNumber: 2, column: 1 } ) ) as jest.MockedFunction<
	() => { lineNumber: number; column: number } | null
>;

const mockEditor = {
	getModel: jest.fn( () => ( {
		getValue: jest.fn( () => 'element.style {\n  color: red;\n}' ),
		getLineCount: jest.fn( () => 3 ),
		getLineMaxColumn: jest.fn( () => 10 ),
		getPositionAt: jest.fn( () => ( { lineNumber: 2, column: 1 } ) ),
		getLineContent: jest.fn( () => 'element.style {' ),
		findMatches: jest.fn( () => [] ),
		uri: { toString: () => 'test-uri' },
	} ) ),
	onDidChangeModelContent: jest.fn( ( callback ) => {
		setTimeout( () => callback(), 100 );
	} ),
	onKeyDown: jest.fn( ( callback ) => {
		mockOnKeyDown.mockImplementation( callback );
	} ),
	getPosition: mockGetPosition,
	layout: jest.fn(),
} as unknown as editor.IStandaloneCodeEditor;

const mockMonaco = {
	MarkerSeverity: {
		Error: 8,
	},
	KeyCode: {
		UpArrow: 1,
		DownArrow: 2,
		LeftArrow: 3,
		RightArrow: 4,
		Home: 5,
		End: 6,
		PageUp: 7,
		PageDown: 8,
		Tab: 9,
		Escape: 10,
		KeyA: 11,
		Enter: 12,
	},
	editor: {
		setModelMarkers: jest.fn(),
		getModelMarkers: jest.fn( () => [] ),
	},
} as unknown as MonacoEditor;

jest.mock( '@monaco-editor/react', () => ( {
	Editor: jest.fn( ( { onMount, defaultValue } ) => {
		React.useEffect( () => {
			onMount( mockEditor, mockMonaco );
		}, [ onMount ] );

		return (
			<div role="textbox" aria-label="CSS Editor">
				<textarea aria-label="CSS Code" defaultValue={ defaultValue } readOnly />
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
		mockGetPosition.mockReturnValue( { lineNumber: 2, column: 1 } );
	} );

	it( 'should render the editor with correct props', () => {
		// Act
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Assert
		expect( screen.getByRole( 'textbox', { name: 'CSS Editor' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'CSS Code' } ) ).toBeInTheDocument();
	} );

	it( 'should set up key handling on mount', async () => {
		// Act
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Assert
		await waitFor( () => {
			expect( mockEditor.onKeyDown ).toHaveBeenCalled();
		} );
	} );

	it( 'should allow navigation keys on protected lines', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );
		mockGetPosition.mockReturnValue( { lineNumber: 1, column: 1 } );

		const mockEvent = {
			keyCode: mockMonaco.KeyCode.UpArrow,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
		};

		// Act
		mockOnKeyDown( mockEvent );

		// Assert
		expect( mockEvent.preventDefault ).not.toHaveBeenCalled();
		expect( mockEvent.stopPropagation ).not.toHaveBeenCalled();
	} );

	it( 'should block editing keys on protected lines', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );
		mockGetPosition.mockReturnValue( { lineNumber: 1, column: 1 } );

		const mockEvent = {
			keyCode: mockMonaco.KeyCode.KeyA,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
		};

		// Act
		mockOnKeyDown( mockEvent );

		// Assert
		expect( mockEvent.preventDefault ).toHaveBeenCalled();
		expect( mockEvent.stopPropagation ).toHaveBeenCalled();
	} );

	it( 'should allow all keys on non-protected lines', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );
		mockGetPosition.mockReturnValue( { lineNumber: 2, column: 1 } );

		const mockEvent = {
			keyCode: mockMonaco.KeyCode.KeyA,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
		};

		// Act
		mockOnKeyDown( mockEvent );

		// Assert
		expect( mockEvent.preventDefault ).not.toHaveBeenCalled();
		expect( mockEvent.stopPropagation ).not.toHaveBeenCalled();
	} );

	it( 'should handle null position gracefully', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );
		mockGetPosition.mockReturnValue( null );

		const mockEvent = {
			keyCode: mockMonaco.KeyCode.KeyA,
			preventDefault: jest.fn(),
			stopPropagation: jest.fn(),
		};

		// Act
		mockOnKeyDown( mockEvent );

		// Assert
		expect( mockEvent.preventDefault ).not.toHaveBeenCalled();
		expect( mockEvent.stopPropagation ).not.toHaveBeenCalled();
	} );

	it( 'should call onChange with unwrapped value when content changes', async () => {
		// Arrange
		const onChange = jest.fn();
		renderWithTheme( <CssEditor value="color: blue;" onChange={ onChange } /> );

		// Act
		await waitFor( () => {
			expect( mockEditor.onDidChangeModelContent ).toHaveBeenCalled();
		} );

		await waitFor(
			() => {
				expect( onChange ).toHaveBeenCalledWith( 'color: red;' );
			},
			{ timeout: 1000 }
		);
	} );

	it( 'should handle resize functionality', () => {
		// Arrange
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		const resizeHandle = screen.getByRole( 'button', { name: /resize/i } );

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
		fireEvent.mouseDown( resizeHandle );

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
		expect( screen.getByRole( 'textbox', { name: 'CSS Code' } ) ).toHaveValue( 'element.style {\n  \n}' );
	} );

	it( 'should handle multiline CSS correctly', () => {
		// Arrange
		const multilineCss = 'color: red;\nbackground: blue;\nfont-size: 16px;';
		renderWithTheme( <CssEditor value={ multilineCss } onChange={ jest.fn() } /> );

		// Assert
		expect( screen.getByRole( 'textbox', { name: 'CSS Code' } ) ).toHaveValue(
			'element.style {\n  color: red;\n  background: blue;\n  font-size: 16px;\n}'
		);
	} );
} );
