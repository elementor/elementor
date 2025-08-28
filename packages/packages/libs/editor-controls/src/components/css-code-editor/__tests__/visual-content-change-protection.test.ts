import type { editor } from 'monaco-types';

import { preventChangeOnVisualContent } from '../visual-content-change-protection';

interface MockModel {
	getLineCount: jest.Mock;
	getLineContent: jest.Mock;
	onDidChangeContent: jest.Mock;
	pushEditOperations: jest.Mock;
}

interface MockEditor {
	getModel: jest.Mock;
	createDecorationsCollection: jest.Mock;
}

interface MockDecorationsCollection {
	set: jest.Mock;
	dispose: jest.Mock;
}

describe( 'preventChangeOnVisualContent', () => {
	let mockModel: MockModel;
	let mockEditor: MockEditor;
	let mockDecorationsCollection: MockDecorationsCollection;

	beforeEach( () => {
		mockDecorationsCollection = {
			set: jest.fn(),
			dispose: jest.fn(),
		};

		mockModel = {
			getLineCount: jest.fn( () => 3 ),
			getLineContent: jest.fn( ( line: number ) => {
				if ( line === 1 ) {
					return 'element.style {';
				}
				if ( line === 3 ) {
					return '}';
				}
				return '  color: red;';
			} ),
			onDidChangeContent: jest.fn(),
			pushEditOperations: jest.fn(),
		};

		mockEditor = {
			getModel: jest.fn( () => mockModel ),
			createDecorationsCollection: jest.fn( () => mockDecorationsCollection ),
		};

		jest.clearAllMocks();
	} );

	describe( 'setup', () => {
		it( 'should return early when editor.getModel() is null', () => {
			// Arrange
			mockEditor.getModel = jest.fn( () => null );

			// Act
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );

			// Assert
			expect( mockEditor.createDecorationsCollection ).not.toHaveBeenCalled();
		} );

		it( 'should create decorations collection and apply initial styling', () => {
			// Act
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );

			// Assert
			expect( mockEditor.createDecorationsCollection ).toHaveBeenCalled();
			expect( mockDecorationsCollection.set ).toHaveBeenCalled();
		} );
	} );

	describe( 'visual styling for first and last line', () => {
		it( 'should apply decoration to first line', () => {
			// Act
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );

			// Assert
			expect( mockDecorationsCollection.set ).toHaveBeenCalledWith(
				expect.arrayContaining( [
					expect.objectContaining( {
						range: {
							startLineNumber: 1,
							startColumn: 1,
							endLineNumber: 1,
							endColumn: 16,
						},
					} ),
				] )
			);
		} );

		it( 'should apply decoration to last line when multiple lines exist', () => {
			// Act
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );

			// Assert
			expect( mockDecorationsCollection.set ).toHaveBeenCalledWith(
				expect.arrayContaining( [
					expect.objectContaining( {
						range: {
							startLineNumber: 3,
							startColumn: 1,
							endLineNumber: 3,
							endColumn: 2,
						},
					} ),
				] )
			);
		} );

		it( 'should handle single line case', () => {
			// Arrange
			mockModel.getLineCount = jest.fn( () => 1 );

			// Act
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );

			// Assert
			const setCall = mockDecorationsCollection.set.mock.calls[ 0 ][ 0 ];
			expect( setCall ).toHaveLength( 1 );
			expect( setCall[ 0 ].range.startLineNumber ).toBe( 1 );
			expect( setCall[ 0 ].range.endColumn ).toBe( 16 );
		} );

		it( 'should reapply decorations when content changes', () => {
			// Arrange
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );
			const contentChangeCallback = mockModel.onDidChangeContent.mock.calls[ 0 ][ 0 ];
			mockDecorationsCollection.set.mockClear();

			// Act
			contentChangeCallback();

			// Assert
			expect( mockDecorationsCollection.set ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'edit protection', () => {
		let originalPushEditOperations: jest.Mock;

		beforeEach( () => {
			originalPushEditOperations = jest.fn();
			mockModel.pushEditOperations = originalPushEditOperations;
			preventChangeOnVisualContent( mockEditor as unknown as editor.IStandaloneCodeEditor );
		} );

		it( 'should block edit operations on first line', () => {
			// Arrange
			const editOperations = [
				{
					range: {
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 1,
						endColumn: 5,
					},
				},
				{
					range: {
						startLineNumber: 2,
						startColumn: 1,
						endLineNumber: 2,
						endColumn: 5,
					},
				},
			];

			// Act
			mockModel.pushEditOperations( null, editOperations, null );

			// Assert
			expect( originalPushEditOperations ).toHaveBeenCalledWith( null, [ editOperations[ 1 ] ], null );
		} );

		it( 'should block edit operations on last line', () => {
			// Arrange
			const editOperations = [
				{
					range: {
						startLineNumber: 2,
						startColumn: 1,
						endLineNumber: 2,
						endColumn: 5,
					},
				},
				{
					range: {
						startLineNumber: 3,
						startColumn: 1,
						endLineNumber: 3,
						endColumn: 2,
					},
				},
			];

			// Act
			mockModel.pushEditOperations( null, editOperations, null );

			// Assert
			expect( originalPushEditOperations ).toHaveBeenCalledWith( null, [ editOperations[ 0 ] ], null );
		} );

		it( 'should allow edit operations on non protected lines', () => {
			// Arrange
			const editOperations = [
				{
					range: {
						startLineNumber: 2,
						startColumn: 1,
						endLineNumber: 2,
						endColumn: 5,
					},
				},
			];

			// Act
			mockModel.pushEditOperations( null, editOperations, null );

			// Assert
			expect( originalPushEditOperations ).toHaveBeenCalledWith( null, editOperations, null );
		} );

		it( 'should block operations spanning across protected lines', () => {
			// Arrange
			const editOperations = [
				{
					range: {
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 2,
						endColumn: 5,
					},
				},
				{
					range: {
						startLineNumber: 2,
						startColumn: 1,
						endLineNumber: 3,
						endColumn: 2,
					},
				},
			];

			// Act
			mockModel.pushEditOperations( null, editOperations, null );

			// Assert
			expect( originalPushEditOperations ).toHaveBeenCalledWith( null, [], null );
		} );
	} );
} );
