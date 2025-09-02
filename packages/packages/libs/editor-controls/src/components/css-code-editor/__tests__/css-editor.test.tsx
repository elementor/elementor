import * as React from 'react';
import type { editor, MonacoEditor } from 'monaco-types';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { CssEditor } from '../css-editor';

jest.mock( '../css-validation', () => ( {
	validate: jest.fn( () => true ),
	setCustomSyntaxRules: jest.fn(),
	clearMarkersFromVisualContent: jest.fn(),
} ) );

import { validate } from '../css-validation';

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

const mockGetPosition = jest.fn( () => ( { lineNumber: 2, column: 1 } ) ) as jest.MockedFunction<
	() => { lineNumber: number; column: number } | null
>;

const mockGetValue = jest.fn( () => 'element.style {\n \n}' );

const mockEditor = {
	getModel: jest.fn( () => ( {
		getValue: mockGetValue,
		getLineCount: jest.fn( () => 3 ),
		getLineMaxColumn: jest.fn( () => 10 ),
		getPositionAt: jest.fn( () => ( { lineNumber: 2, column: 1 } ) ),
		getLineContent: jest.fn( () => 'element.style {' ),
		findMatches: jest.fn( () => [] ),
		uri: { toString: () => 'test-uri' },
		onDidChangeContent: jest.fn(),
		pushEditOperations: jest.fn(),
	} ) ),
	getPosition: mockGetPosition,
	setPosition: jest.fn(),
	layout: jest.fn(),
	createDecorationsCollection: jest.fn( () => ( {
		set: jest.fn(),
		dispose: jest.fn(),
	} ) ),
} as unknown as editor.IStandaloneCodeEditor;

const mockMonaco = {
	MarkerSeverity: {
		Error: 8,
	},
	editor: {
		setModelMarkers: jest.fn(),
		getModelMarkers: jest.fn( () => [] ),
		createDecorationsCollection: jest.fn( () => ( {
			set: jest.fn(),
			dispose: jest.fn(),
		} ) ),
		onDidChangeMarkers: jest.fn(),
	},
} as unknown as MonacoEditor;

jest.mock( '@monaco-editor/react', () => ( {
	Editor: jest.fn( ( { onMount, onChange, value } ) => {
		React.useEffect( () => {
			onMount( mockEditor, mockMonaco );
			if ( onChange ) {
				setTimeout( () => onChange(), 100 );
			}
		}, [ onMount, onChange ] );

		return (
			<div role="textbox" aria-label="CSS Editor" data-testid="css-editor">
				<textarea aria-label="CSS Code" defaultValue={ value } readOnly />
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
		mockGetValue.mockReturnValue( 'element.style {\n \n}' );
		mockGetPosition.mockReturnValue( { lineNumber: 2, column: 1 } );
	} );

	it( 'should render the editor with correct props', () => {
		// Act
		renderWithTheme( <CssEditor { ...defaultProps } /> );

		// Assert
		expect( screen.getByRole( 'textbox', { name: 'CSS Editor' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'CSS Code' } ) ).toBeInTheDocument();
	} );

	it( 'should call onChange with unwrapped value when content changes', async () => {
		// Arrange
		const onChange = jest.fn();
		mockGetValue.mockReturnValue( 'element.style {\n  color: blue;\n}' );

		renderWithTheme( <CssEditor value="color: green;" onChange={ onChange } /> );

		// Act & Assert
		await waitFor(
			() => {
				expect( onChange ).toHaveBeenCalledWith( 'color: blue;', true );
			},
			{ timeout: 1000 }
		);
	} );

	it( 'should call onChange with unwrapped value and validation flag false when content has errors', async () => {
		// Arrange
		const onChange = jest.fn();

		mockGetValue.mockReturnValue( 'element.style {\n  color: red\n}' );
		( validate as jest.Mock ).mockReturnValue( false );

		renderWithTheme( <CssEditor value="color: red" onChange={ onChange } /> );

		// Act & Assert
		await waitFor(
			() => {
				expect( onChange ).toHaveBeenCalledWith( 'color: red', false );
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
