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
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			expect( screen.getByTestId( 'upload-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'click-to-upload' ) ).toBeTruthy();
			expect( screen.getByTestId( 'helper-text' ) ).toBeTruthy();
			expect( screen.getByTestId( 'file-input' ) ).toBeTruthy();
		} );

		it( 'should render with custom className', () => {
			render(
				<DropZone onFileSelect={ mockOnFileSelect } className="custom-class" />,
			);

			expect( screen.getByTestId( 'drop-zone' ).className ).toContain( 'custom-class' );
		} );

		it( 'should render with custom icon', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					icon="custom-icon-class"
				/>,
			);

			expect( screen.getByTestId( 'custom-icon' ).className ).toContain( 'custom-icon-class' );
		} );

		it( 'should render loading state', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					isLoading={ true }
				/>,
			);

			expect( screen.getByTestId( 'loading-spinner' ) ).toBeTruthy();
			expect( screen.getByTestId( 'loading-overlay' ) ).toBeTruthy();
		} );

		it( 'should render error state', () => {
			const error = { message: 'Test error message' };

			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					error={ error }
				/>,
			);

			expect( screen.getByTestId( 'helper-text' ).textContent ).toBe( 'Test error message' );
		} );
	} );

	describe( 'File Validation', () => {
		it( 'should validate allowed MIME types', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [ 'application/zip' ] }
				/>,
			);

			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should validate file extensions', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [ 'application/zip' ] }
				/>,
			);

			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/octet-stream' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should reject invalid file types', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [ 'application/zip' ] }
				/>,
			);

			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).toHaveBeenCalledWith( {
				id: 'file_not_allowed',
				message: 'This file type is not allowed',
			} );
		} );

		it( 'should allow all file types when filetypes is empty', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [] }
				/>,
			);

			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple allowed file types', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [ 'application/zip', 'application/json' ] }
				/>,
			);

			const mockJsonFile = new File( [ '{}' ], 'test.json', { type: 'application/json' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockJsonFile ],
				},
			} );

			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockJsonFile, expect.any( Object ), 'drop' );
			expect( mockOnError ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Drag and Drop Functionality', () => {
		it( 'should handle drag enter event', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			const dropZone = screen.getByTestId( 'drop-zone' );

			expect( () => {
				fireEvent.dragEnter( dropZone, {
					dataTransfer: {
						items: [ { kind: 'file' } ],
					},
				} );
			} ).not.toThrow();
		} );

		it( 'should handle drag leave event', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			const dropZone = screen.getByTestId( 'drop-zone' );

			expect( () => {
				fireEvent.dragLeave( dropZone );
			} ).not.toThrow();
		} );

		it( 'should handle drag over event', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			const dropZone = screen.getByTestId( 'drop-zone' );

			expect( () => {
				fireEvent.dragOver( dropZone );
			} ).not.toThrow();
		} );

		it( 'should not process files when loading', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					isLoading={ true }
				/>,
			);

			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			const dropZone = screen.getByTestId( 'drop-zone' );
			fireEvent.drop( dropZone, {
				dataTransfer: {
					files: [ mockFile ],
				},
			} );

			expect( mockOnFileSelect ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'File Input Handling', () => {
		it( 'should handle file input change with valid file', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onFileChoose={ mockOnFileChoose }
					filetypes={ [ 'application/zip' ] }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			const mockFile = new File( [ 'test' ], 'test.zip', { type: 'application/zip' } );

			Object.defineProperty( fileInput, 'files', {
				value: [ mockFile ],
				writable: false,
			} );

			fireEvent.change( fileInput );

			expect( mockOnFileSelect ).toHaveBeenCalledWith( mockFile, expect.any( Object ), 'browse' );
			expect( mockOnFileChoose ).toHaveBeenCalledWith( mockFile );
		} );

		it( 'should handle file input change with invalid file', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onError={ mockOnError }
					filetypes={ [ 'application/zip' ] }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			const mockFile = new File( [ 'test' ], 'test.txt', { type: 'text/plain' } );

			Object.defineProperty( fileInput, 'files', {
				value: [ mockFile ],
				writable: false,
			} );

			fireEvent.change( fileInput );

			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).toHaveBeenCalledWith( {
				id: 'file_not_allowed',
				message: 'This file type is not allowed',
			} );
		} );

		it( 'should handle file input change with no file selected', () => {
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

			fireEvent.change( fileInput );

			expect( mockOnFileSelect ).not.toHaveBeenCalled();
			expect( mockOnError ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle click to upload', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					onButtonClick={ mockOnButtonClick }
				/>,
			);

			const clickableText = screen.getByTestId( 'click-to-upload' );
			fireEvent.click( clickableText );

			expect( mockOnButtonClick ).toHaveBeenCalled();
			expect( HTMLInputElement.prototype.click ).toHaveBeenCalled();
		} );

		it( 'should trigger file input click without onButtonClick', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			const clickableText = screen.getByTestId( 'click-to-upload' );
			fireEvent.click( clickableText );

			expect( HTMLInputElement.prototype.click ).toHaveBeenCalled();
		} );
	} );

	describe( 'Props Handling', () => {
		it( 'should use default filetypes when not provided', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );

			const fileInput = screen.getByTestId( 'file-input' );
			expect( fileInput.getAttribute( 'accept' ) ).toContain( 'application/zip' );
		} );

		it( 'should use provided filetypes', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					filetypes={ [ 'application/json' ] }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			expect( fileInput.getAttribute( 'accept' ) ).toContain( 'application/json' );
		} );

		it( 'should handle additional props spread', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					data-custom="custom-value"
				/>,
			);

			const dropZone = screen.getByTestId( 'drop-zone' );
			expect( dropZone.getAttribute( 'data-custom' ) ).toBe( 'custom-value' );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have unique id for file input', () => {
			render( <DropZone onFileSelect={ mockOnFileSelect } /> );
			const fileInput = screen.getByTestId( 'file-input' );

			expect( fileInput ).toBeTruthy();
			expect( fileInput.getAttribute( 'id' ) ).toBeTruthy();
		} );

		it( 'should have proper accept attribute', () => {
			render(
				<DropZone
					onFileSelect={ mockOnFileSelect }
					filetypes={ [ 'application/zip', 'application/json' ] }
				/>,
			);

			const fileInput = screen.getByTestId( 'file-input' );
			const acceptValue = fileInput.getAttribute( 'accept' );

			expect( acceptValue ).toContain( 'application/zip' );
			expect( acceptValue ).toContain( 'application/json' );
		} );
	} );
} );
