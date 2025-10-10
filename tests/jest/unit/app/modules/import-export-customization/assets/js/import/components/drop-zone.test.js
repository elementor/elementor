import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropZone from 'elementor/app/modules/import-export-customization/assets/js/import/components/drop-zone';

describe( 'DropZone Component', () => {
	let mockOnFileSelect;
	let mockOnError;
	let mockOnButtonClick;
	let mockOnFileChoose;

	beforeEach( () => {
		mockOnFileSelect = jest.fn();
		mockOnError = jest.fn();
		mockOnButtonClick = jest.fn();
		mockOnFileChoose = jest.fn();

		// Mock file input click
		HTMLInputElement.prototype.click = jest.fn();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'should render with default props', () => {
			// Act
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			// Assert
			expect( screen.getByTestId( 'upload-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'click-to-upload' ) ).toBeTruthy();
			expect( screen.getByTestId( 'helper-text' ) ).toBeTruthy();
			expect( screen.getByTestId( 'file-input' ) ).toBeTruthy();
		} );

		it( 'should render with custom className', () => {
			// Arrange
			const customClassName = 'custom-class';

			// Act
			render(
				<DropZone onFileSelect={ mockOnFileSelect } className={ customClassName } />,
			);

			// Assert
			expect( screen.getByTestId( 'drop-zone' ).className ).toContain( customClassName );
		} );

		it( 'should render loading state', () => {
			// Arrange
			const isLoading = true;

			// Act
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					isLoading={ isLoading }
				/>,
			);

			// Assert
			expect( screen.getByTestId( 'loading-spinner' ) ).toBeTruthy();
			expect( screen.queryByTestId( 'upload-icon' ) ).toBeFalsy();
		} );

		it( 'should render error state', () => {
			// Arrange
			const error = { message: 'Test error message' };

			// Act
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					error={ error }
				/>,
			);

			// Assert
			expect( screen.getByTestId( 'helper-text' ).textContent ).toBe( 'Test error message' );
		} );
	} );

	describe( 'File Validation', () => {
		it( 'should validate allowed MIME types', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip' ];
			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should validate file extensions', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip' ];
			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/octet-stream' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should reject invalid file types', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip' ];
			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).toHaveBeenCalledWith( {
				id: 'file_not_allowed',
				message: 'This file type is not allowed',
			} );
		} );

		it( 'should allow all file types when filetypes is empty', () => {
			// Arrange
			const allowedFileTypes = [];
			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple allowed file types', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip', 'application/json' ];
			const mockJsonFile = new File( [ '{}' ], 'test.json', { type: 'application/json' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockJsonFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockJsonFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Drag and Drop Functionality', () => {
		it( 'should handle drag enter event', () => {
			// Arrange
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );
			const dropZone = screen.getByTestId( 'drop-zone' );

			// Act & Assert
			expect( () => {
				fireEvent.dragEnter( dropZone, {
					dataTransfer: {
						items: [ { kind: 'file' } ],
					},
				} );
			} ).not.toThrow();
		} );

		it( 'should handle drag leave event', () => {
			// Arrange
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );
			const dropZone = screen.getByTestId( 'drop-zone' );

			// Act & Assert
			expect( () => {
				fireEvent.dragLeave( dropZone );
			} ).not.toThrow();
		} );

		it( 'should handle drag over event', () => {
			// Arrange
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );
			const dropZone = screen.getByTestId( 'drop-zone' );

			// Act & Assert
			expect( () => {
				fireEvent.dragOver( dropZone );
			} ).not.toThrow();
		} );

		it( 'should not process files when loading', () => {
			// Arrange
			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					isLoading={ true }
				/>,
			);

			// Act
			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			// Assert
			expect( mockOnFileSelect ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'File Input Handling', () => {
		it( 'should handle file input change with valid file', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip' ];
			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onFileChoose={ mockOnFileChoose }
					filetypes={ allowedFileTypes }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			Object.defineProperty( fileInput, 'files', {
				value: [ mockFile ],
				writable: false,
			} );

			// Act
			fireEvent.change( fileInput );

			// Assert
			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'browse' );
			expect( mockOnFileChoose ).toHaveBeenCalledWith( mockFile );
		} );

		it( 'should handle file input change with invalid file', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip' ];
			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ allowedFileTypes }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			Object.defineProperty( fileInput, 'files', {
				value: [ mockFile ],
				writable: false,
			} );

			// Act
			fireEvent.change( fileInput );

			// Assert
			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).toHaveBeenCalledWith( {
				id: 'file_not_allowed',
				message: 'This file type is not allowed',
			} );
		} );

		it( 'should handle file input change with no file selected', () => {
			// Arrange
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			Object.defineProperty( fileInput, 'files', {
				value: [],
				writable: false,
			} );

			// Act
			fireEvent.change( fileInput );

			// Assert
			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle click to upload', () => {
			// Arrange
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onButtonClick={ mockOnButtonClick }
				/>,
			);

			// Act
			const clickableText = screen.getByTestId( 'click-to-upload' );
			fireEvent.click( clickableText );

			// Assert
			expect( mockOnButtonClick ).toHaveBeenCalled();
			expect( HTMLInputElement.prototype.click ).toHaveBeenCalled();
		} );

		it( 'should trigger file input click without onButtonClick', () => {
			// Arrange
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			// Act
			const clickableText = screen.getByTestId( 'click-to-upload' );
			fireEvent.click( clickableText );

			// Assert
			expect( HTMLInputElement.prototype.click ).toHaveBeenCalled();
		} );
	} );

	describe( 'Props Handling', () => {
		it( 'should use default filetypes when not provided', () => {
			// Arrange & Act
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			// Assert
			const fileInput = screen.getByTestId( 'file-input' );
			expect( fileInput.getAttribute( 'accept' ) ).toContain( 'application/zip' );
		} );

		it( 'should use provided filetypes', () => {
			// Arrange
			const customFileTypes = [ 'application/json' ];

			// Act
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					filetypes={ customFileTypes }
				/>,
			);

			// Assert
			const fileInput = screen.getByTestId( 'file-input' );
			expect( fileInput.getAttribute( 'accept' ) ).toContain( 'application/json' );
		} );

		it( 'should handle additional props spread', () => {
			// Arrange
			const customAttribute = 'custom-value';

			// Act
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					data-custom={ customAttribute }
				/>,
			);

			// Assert
			const dropZone = screen.getByTestId( 'drop-zone' );
			expect( dropZone.getAttribute( 'data-custom' ) ).toBe( customAttribute );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have unique id for file input', () => {
			// Arrange & Act
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			// Assert
			const fileInput = screen.getByTestId( 'file-input' );
			expect( fileInput ).toBeTruthy();
			expect( fileInput.getAttribute( 'id' ) ).toBeTruthy();
		} );

		it( 'should have proper accept attribute', () => {
			// Arrange
			const allowedFileTypes = [ 'application/zip', 'application/json' ];

			// Act
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					filetypes={ allowedFileTypes }
				/>,
			);

			// Assert
			const fileInput = screen.getByTestId( 'file-input' );
			const acceptValue = fileInput.getAttribute( 'accept' );
			expect( acceptValue ).toContain( 'application/zip' );
			expect( acceptValue ).toContain( 'application/json' );
		} );
	} );
} );
