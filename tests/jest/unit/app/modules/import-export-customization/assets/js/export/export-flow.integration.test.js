import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportContextProvider, useExportContext, EXPORT_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';
import { useExportKit } from 'elementor/app/modules/import-export-customization/assets/js/export/hooks/use-export-kit';
import { generateScreenshot } from 'elementor/app/modules/import-export-customization/assets/js/export/utils/screenshot';

// Mock the screenshot utility
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/utils/screenshot', () => ( {
	generateScreenshot: jest.fn(),
} ) );

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test component that uses the export context and hook
const TestExportFlow = () => {
	const { data, dispatch, isTemplateNameValid, isExporting, isCompleted } = useExportContext();
	const { status } = useExportKit( {
		includes: data.includes,
		kitInfo: data.kitInfo,
		plugins: data.plugins,
		isExporting,
		dispatch,
	} );

	return (
		<div>
			<h1>Export Flow Test</h1>
			<div data-testid="export-status">Status: { data.exportStatus }</div>
			<div data-testid="template-valid">Template Valid: { isTemplateNameValid ? 'true' : 'false' }</div>
			<div data-testid="export-includes">Includes: { data.includes.join( ', ' ) }</div>
			<div data-testid="kit-info">Kit: { data.kitInfo.title || 'No Title' } - { data.kitInfo.source || 'No Source' }</div>
			<div data-testid="hook-status">Hook Status: { status }</div>
			
			<button onClick={ () => {
				dispatch( { type: 'SET_KIT_TITLE', payload: 'Test Kit' } );
				dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'file' } );
				dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
			} }>
				Start File Export
			</button>
			<button onClick={ () => {
				dispatch( { type: 'SET_KIT_TITLE', payload: 'Cloud Kit' } );
				dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: 'cloud' } );
				dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } );
			} }>
				Start Cloud Export
			</button>
			<button onClick={ () => dispatch( { type: 'ADD_INCLUDE', payload: 'custom-posts' } ) }>
				Add Custom Posts
			</button>
			<button onClick={ () => dispatch( { type: 'REMOVE_INCLUDE', payload: 'plugins' } ) }>
				Remove Plugins
			</button>
			
			{ isCompleted && (
				<div data-testid="export-completed">Export Completed</div>
			) }
			
			{ status === 'error' && (
				<div data-testid="export-error">Export Error</div>
			) }
		</div>
	);
};

describe( 'Export Flow Integration', () => {
	beforeEach( () => {
		// Mock global objects
		global.elementorCommon = {
			config: {
				experimentalFeatures: {
					'cloud-library': true,
				},
			},
		};
		
		global.elementorAppConfig = {
			'import-export-customization': {
				restApiBaseUrl: 'https://example.com/wp-json/elementor/v1',
				kitPreviewNonce: 'mock-nonce',
			},
			base_url: 'https://example.com',
		};

		global.wpApiSettings = { nonce: 'wp-nonce' };

		// Mock window.location
		delete window.location;
		window.location = { href: '' };

		// Clear mocks
		mockFetch.mockClear();
		generateScreenshot.mockClear();
	} );

	describe( 'Initial State and Setup', () => {
		it( 'should initialize with correct default state', () => {
			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: PENDING' );
			expect( screen.getByTestId( 'template-valid' ).textContent ).toBe( 'Template Valid: false' );
			expect( screen.getByTestId( 'export-includes' ).textContent ).toBe( 'Includes: content, templates, settings, plugins' );
			expect( screen.getByTestId( 'kit-info' ).textContent ).toBe( 'Kit: No Title - No Source' );
		} );

		it( 'should handle includes management', () => {
			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Add custom posts
			fireEvent.click( screen.getByText( 'Add Custom Posts' ) );
			expect( screen.getByTestId( 'export-includes' ).textContent ).toBe( 'Includes: content, templates, settings, plugins, custom-posts' );

			// Remove plugins
			fireEvent.click( screen.getByText( 'Remove Plugins' ) );
			expect( screen.getByTestId( 'export-includes' ).textContent ).toBe( 'Includes: content, templates, settings, custom-posts' );
		} );
	} );

	describe( 'File Export Flow', () => {
		it( 'should complete file export successfully', async () => {
			const mockResponseData = {
				data: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start file export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Check state updates
			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: EXPORTING' );
			expect( screen.getByTestId( 'template-valid' ).textContent ).toBe( 'Template Valid: true' );
			expect( screen.getByTestId( 'kit-info' ).textContent ).toBe( 'Kit: Test Kit - file' );

			// Wait for export to complete
			await waitFor( () => {
				expect( screen.getByTestId( 'export-completed' ) ).toBeTruthy();
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/export',
				expect.objectContaining( {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': 'wp-nonce',
					},
				} )
			);
		} );

		it( 'should handle file export errors', async () => {
			const mockErrorResponse = {
				data: {
					message: 'Export failed',
					code: 'EXPORT_ERROR',
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: false,
				json: jest.fn().mockResolvedValue( mockErrorResponse ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start file export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Wait for error to occur
			await waitFor( () => {
				expect( screen.getByTestId( 'export-error' ) ).toBeTruthy();
			} );

			expect( screen.getByTestId( 'hook-status' ).textContent ).toBe( 'Hook Status: error' );
		} );
	} );

	describe( 'Cloud Export Flow', () => {
		it( 'should complete cloud export with screenshot', async () => {
			const mockScreenshot = 'data:image/png;base64,mockscreenshot';
			generateScreenshot.mockResolvedValue( mockScreenshot );

			const mockResponseData = {
				data: {
					kit: {
						id: 123,
						title: 'Cloud Kit',
						url: 'https://example.com/kit/123',
					},
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start cloud export
			fireEvent.click( screen.getByText( 'Start Cloud Export' ) );

			// Check state updates
			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: EXPORTING' );
			expect( screen.getByTestId( 'kit-info' ).textContent ).toBe( 'Kit: Cloud Kit - cloud' );

			// Wait for export to complete
			await waitFor( () => {
				expect( screen.getByTestId( 'export-completed' ) ).toBeTruthy();
			} );

			expect( generateScreenshot ).toHaveBeenCalled();
		} );

		it( 'should handle cloud export without screenshot feature', async () => {
			global.elementorCommon.config.experimentalFeatures[ 'cloud-library' ] = false;

			const mockResponseData = {
				data: {
					kit: {
						id: 123,
						title: 'Cloud Kit',
					},
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start cloud export
			fireEvent.click( screen.getByText( 'Start Cloud Export' ) );

			// Wait for export to complete
			await waitFor( () => {
				expect( screen.getByTestId( 'export-completed' ) ).toBeTruthy();
			} );

			// Verify no screenshot was generated
			expect( generateScreenshot ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Export Data Validation', () => {
		it( 'should send correct export data for file export', async () => {
			const mockResponseData = {
				data: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start file export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Wait for fetch to be called
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/export',
				expect.objectContaining( {
					method: 'POST',
					body: expect.stringContaining( '"title":"Test Kit"' ),
				} )
			);
		} );

		it( 'should handle whitespace in kit title', async () => {
			const mockResponseData = {
				data: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			const TestComponent = () => {
				const { dispatch } = useExportContext();
				const { status } = useExportKit( {
					includes: [ 'content' ],
					kitInfo: { title: '  My Kit  ', source: 'file' },
					plugins: [],
					isExporting: true,
					dispatch,
				} );

				return (
					<div>
						<button onClick={ () => dispatch( { type: 'SET_EXPORT_STATUS', payload: EXPORT_STATUS.EXPORTING } ) }>
							Export
						</button>
					</div>
				);
			};

			render(
				<ExportContextProvider>
					<TestComponent />
				</ExportContextProvider>
			);

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: expect.stringContaining( '"title":"My Kit"' ),
				} )
			);
		} );
	} );

	describe( 'Error Handling and Recovery', () => {
		it( 'should handle network errors gracefully', async () => {
			mockFetch.mockRejectedValueOnce( new Error( 'Network error' ) );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Wait for error to occur
			await waitFor( () => {
				expect( screen.getByTestId( 'export-error' ) ).toBeTruthy();
			} );

			expect( screen.getByTestId( 'hook-status' ).textContent ).toBe( 'Hook Status: error' );
		} );

		it( 'should handle invalid response format', async () => {
			const mockInvalidResponse = {
				data: {
					// Missing required 'file' property for file export
					manifest: { version: '1.0' },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockInvalidResponse ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Start export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Wait for error to occur
			await waitFor( () => {
				expect( screen.getByTestId( 'export-error' ) ).toBeTruthy();
			} );
		} );
	} );

	describe( 'State Management Integration', () => {
		it( 'should maintain state consistency across components', async () => {
			const mockResponseData = {
				data: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Initial state
			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: PENDING' );
			expect( screen.getByTestId( 'template-valid' ).textContent ).toBe( 'Template Valid: false' );

			// Start export
			fireEvent.click( screen.getByText( 'Start File Export' ) );

			// Check state transitions
			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: EXPORTING' );
			expect( screen.getByTestId( 'template-valid' ).textContent ).toBe( 'Template Valid: true' );

			// Wait for completion
			await waitFor( () => {
				expect( screen.getByTestId( 'export-completed' ) ).toBeTruthy();
			} );

			expect( screen.getByTestId( 'export-status' ).textContent ).toBe( 'Status: COMPLETED' );
		} );

		it( 'should handle multiple rapid state changes', () => {
			render(
				<ExportContextProvider>
					<TestExportFlow />
				</ExportContextProvider>
			);

			// Rapid state changes
			fireEvent.click( screen.getByText( 'Add Custom Posts' ) );
			fireEvent.click( screen.getByText( 'Remove Plugins' ) );
			fireEvent.click( screen.getByText( 'Add Custom Posts' ) ); // Should not duplicate

			expect( screen.getByTestId( 'export-includes' ).textContent ).toBe( 'Includes: content, templates, settings, custom-posts' );
		} );
	} );
} );
