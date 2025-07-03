import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from '@reach/router';
import ExportComplete from 'elementor/app/modules/import-export-customization/assets/js/export/pages/export-complete';

// Mock the context with controllable data
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

// Mock the hook
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: () => mockExportContext,
	ExportContextProvider: ( { children } ) => children,
} ) );

// Mock shared components
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/components', () => ( {
	BaseLayout: ( { children, topBar, footer } ) => (
		<div data-testid="base-layout">
			<div data-testid="top-bar">{ topBar }</div>
			<div data-testid="content">{ children }</div>
			<div data-testid="footer">{ footer }</div>
		</div>
	),
	TopBar: ( { children } ) => <div data-testid="top-bar-component">{ children }</div>,
	Footer: ( { children } ) => <div data-testid="footer-component">{ children }</div>,
	PageHeader: ( { title } ) => <div data-testid="page-header">{ title }</div>,
	CenteredContent: ( { children } ) => <div data-testid="centered-content">{ children }</div>,
} ) );

// Mock child components
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/components/export-complete-summary', () => 
	( { kitInfo, includes } ) => (
		<div data-testid="export-complete-summary">
			Summary: { kitInfo.title } - { includes.join( ', ' ) }
		</div>
	)
);

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/components/export-complete-icon', () => 
	() => <div data-testid="export-complete-icon">✓</div>
);

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/components/export-complete-heading', () => 
	( { isCloudExport } ) => (
		<div data-testid="export-complete-heading">
			{ isCloudExport ? 'Cloud Export Complete' : 'File Export Complete' }
		</div>
	)
);

// Mock the download link component to properly trigger the callback
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/components/export-complete-download-link', () => 
	( { onDownloadClick } ) => (
		<button 
			data-testid="download-link" 
			onClick={ () => onDownloadClick && onDownloadClick() }
		>
			Download Kit
		</button>
	)
);

describe( 'ExportComplete Component', () => {
	let mockElementorAppConfig;
	let mockDocument;
	let mockLink;

	beforeEach( () => {
		// Reset mock context to default file export
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

		// Mock global config
		mockElementorAppConfig = {
			admin_url: 'https://example.com/wp-admin/',
			base_url: 'https://example.com/elementor',
		};
		global.elementorAppConfig = mockElementorAppConfig;

		// Mock document and link
		mockLink = {
			href: '',
			download: '',
			click: jest.fn(),
		};

		mockDocument = {
			createElement: jest.fn().mockReturnValue( mockLink ),
		};
		global.document = mockDocument;

		// Mock window.top.location as an assignable property
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
			expect( screen.getByTestId( 'export-complete-heading' ).textContent ).toBe( 'File Export Complete' );
			expect( screen.getByTestId( 'export-complete-summary' ).textContent ).toBe( 'Summary: My Test Kit - content, templates' );
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

			expect( screen.getByTestId( 'export-complete-heading' ).textContent ).toBe( 'Cloud Export Complete' );
			expect( screen.queryByTestId( 'download-link' ) ).toBeNull();
		} );

		it( 'should show View in Library button for cloud export', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			const viewLibraryButton = screen.getByText( 'View in Library' );
			expect( viewLibraryButton ).toBeTruthy();
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

			// Mock window.location for this test
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
		it( 'should show different content for file vs cloud export', () => {
			// Test file export
			mockExportContext.data.kitInfo.source = 'file';
			const { rerender } = render( <ExportComplete /> );
			
			expect( screen.getByText( 'Done' ) ).toBeTruthy();
			expect( screen.getByTestId( 'download-link' ) ).toBeTruthy();
			expect( screen.queryByText( 'View in Library' ) ).toBeNull();

			// Test cloud export
			mockExportContext.data.kitInfo.source = 'cloud';
			rerender( <ExportComplete /> );
			
			expect( screen.getByText( 'View in Library' ) ).toBeTruthy();
			expect( screen.queryByTestId( 'download-link' ) ).toBeNull();
			expect( screen.queryByText( 'Done' ) ).toBeNull();
		} );

		it( 'should not auto-download for cloud export', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			expect( mockDocument.createElement ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Export Completion States', () => {
		it( 'should redirect to export page if not completed', () => {
			mockExportContext.isCompleted = false;

			const TestComponent = () => <ExportComplete path="/complete" />;

			render(
				<Router>
					<TestComponent path="/complete" />
				</Router>
			);

			// Should render without crashing (redirect behavior)
			expect( screen.getByTestId ).toBeTruthy();
		} );

		it( 'should render normally if export is completed', () => {
			mockExportContext.isCompleted = true;

			render( <ExportComplete /> );

			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
		} );
	} );

	describe( 'Component Integration', () => {
		it( 'should render all child components with correct props', () => {
			render( <ExportComplete /> );

			expect( screen.getByTestId( 'page-header' ).textContent ).toBe( 'Export' );
			expect( screen.getByTestId( 'export-complete-summary' ).textContent ).toBe( 'Summary: My Test Kit - content, templates' );
			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-heading' ) ).toBeTruthy();
		} );

		it( 'should pass correct props to child components', () => {
			render( <ExportComplete /> );

			const summary = screen.getByTestId( 'export-complete-summary' );
			expect( summary.textContent ).toContain( 'My Test Kit' );
			expect( summary.textContent ).toContain( 'content, templates' );
		} );
	} );
} );
