import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

		global.elementorCommon = {
			config: {
				isRTL: false,
			},
		};

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

			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-heading' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-summary' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-download-link' ) ).toBeTruthy();
			expect( screen.getByTestId( 'done-button' ) ).toBeTruthy();
		} );

		it( 'should show Done button for file export', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByTestId( 'done-button' );
			expect( doneButton ).toBeTruthy();
		} );

		it( 'should render cloud export completion page', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-heading' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-summary' ) ).toBeTruthy();
			expect( screen.queryByTestId( 'export-complete-download-link' ) ).toBeNull();
			expect( screen.getByTestId( 'view-in-library-button' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle Done button click', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByTestId( 'done-button' );
			fireEvent.click( doneButton );

			expect( window.top.location ).toBe( 'https://example.com/wp-admin/' );
		} );

		it( 'should handle View in Library button click', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			delete window.location;
			window.location = { href: '' };

			render( <ExportComplete /> );

			const viewLibraryButton = screen.getByTestId( 'view-in-library-button' );
			fireEvent.click( viewLibraryButton );

			expect( window.location.href ).toBe( 'https://example.com/elementor#/kit-library/cloud' );
		} );

		it( 'should show download link for file export', () => {
			render( <ExportComplete /> );

			const downloadLink = screen.getByTestId( 'export-complete-download-link' );
			expect( downloadLink ).toBeTruthy();
		} );
	} );

	describe( 'Export Type Handling', () => {
		it( 'should auto-download for file export', async () => {
			mockExportContext.data.kitInfo.source = 'file';

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockDocument.createElement ).toHaveBeenCalledWith( 'a' );
				expect( mockLink.click ).toHaveBeenCalled();
			} );
		} );

		it( 'should not auto-download for cloud export', async () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockDocument.createElement ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
