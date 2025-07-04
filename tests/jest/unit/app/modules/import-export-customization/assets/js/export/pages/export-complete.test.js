import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportComplete from 'elementor/app/modules/import-export-customization/assets/js/export/pages/export-complete';

let mockExportContext = {
	data: {
		exportedData: {
			file: 'base64encodedfile',
			manifest: { version: '1.0' },
		},
		kitInfo: {
			title: 'My Test Kit',
			source: 'file',
		},
		includes: [ 'content', 'templates' ],
	},
	isCompleted: true,
};

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: () => mockExportContext,
	ExportContextProvider: ( { children } ) => children,
} ) );

// Mock the download link component to properly trigger the callback
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/components/export-complete-download-link', () => 
	( { onDownloadClick } ) => (
		<button 
			data-testid="download-link" 
			onClick={ () => onDownloadClick && onDownloadClick() }
		>
			Download manually
		</button>
	)
);

describe( 'ExportComplete Component', () => {
	let mockElementorAppConfig;
	let mockDocument;
	let mockLink;

	beforeEach( () => {
		mockExportContext = {
			data: {
				exportedData: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
				kitInfo: {
					title: 'My Test Kit',
					source: 'file',
				},
				includes: [ 'content', 'templates' ],
			},
			isCompleted: true,
		};

		mockElementorAppConfig = {
			admin_url: 'https://example.com/wp-admin/',
			base_url: 'https://example.com/elementor',
		};
		global.elementorAppConfig = mockElementorAppConfig;

		mockLink = {
			href: '',
			download: '',
			click: jest.fn(),
		};

		mockDocument = {
			createElement: jest.fn().mockReturnValue( mockLink ),
		};
		global.document = mockDocument;

		Object.defineProperty( window, 'top', {
			value: { location: '' },
			writable: true,
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'should render file export completion page', () => {
			render( <ExportComplete /> );

			expect( screen.getByText( 'Download manually' ) ).toBeTruthy();
			expect( screen.getByTestId( 'download-link' ) ).toBeTruthy();
		} );

		it( 'should show Done button for file export', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByText( 'Done' );
			expect( doneButton ).toBeTruthy();
		} );

		it( 'should render cloud export completion page', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			expect( screen.queryByTestId( 'download-link' ) ).toBeNull();
			expect( screen.getByText( 'View in Library' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle Done button click', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByText( 'Done' );
			fireEvent.click( doneButton );

			expect( window.top.location ).toBe( 'https://example.com/wp-admin/' );
		} );

		it( 'should handle View in Library button click', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			delete window.location;
			window.location = { href: '' };

			render( <ExportComplete /> );

			const viewLibraryButton = screen.getByText( 'View in Library' );
			fireEvent.click( viewLibraryButton );

			expect( window.location.href ).toBe( 'https://example.com/elementor#/kit-library/cloud' );
		} );

		it( 'should show download button for file export', () => {
			render( <ExportComplete /> );

			const downloadButton = screen.getByTestId( 'download-link' );
			expect( downloadButton ).toBeTruthy();
		} );
	} );

	describe( 'Export Type Handling', () => {
		it( 'should not auto-download for cloud export', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			expect( mockDocument.createElement ).not.toHaveBeenCalled();
		} );
	} );
} );
