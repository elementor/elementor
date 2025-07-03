import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportKit } from 'elementor/app/modules/import-export-customization/assets/js/export/hooks/use-export-kit';
import { generateScreenshot } from 'elementor/app/modules/import-export-customization/assets/js/export/utils/screenshot';
import { EXPORT_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';

// Mock the screenshot utility
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/utils/screenshot', () => ( {
	generateScreenshot: jest.fn(),
} ) );

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe( 'useExportKit Hook', () => {
	let mockDispatch;
	let mockElementorCommon;
	let mockElementorAppConfig;

	beforeEach( () => {
		mockDispatch = jest.fn();
		
		// Mock global objects
		mockElementorCommon = {
			config: {
				experimentalFeatures: {
					'cloud-library': true,
				},
			},
		};
		
		mockElementorAppConfig = {
			'import-export-customization': {
				restApiBaseUrl: 'https://example.com/wp-json/elementor/v1',
				kitPreviewNonce: 'mock-nonce',
			},
			base_url: 'https://example.com',
		};

		global.elementorCommon = mockElementorCommon;
		global.elementorAppConfig = mockElementorAppConfig;
		global.wpApiSettings = { nonce: 'wp-nonce' };

		// Mock window.location
		delete window.location;
		window.location = { href: '' };

		// Clear mocks
		mockFetch.mockClear();
		mockDispatch.mockClear();
		generateScreenshot.mockClear();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Export Kit to File', () => {
		it( 'should successfully export kit as file', async () => {
			const mockIncludes = [ 'content', 'templates' ];
			const mockKitInfo = {
				title: 'My Kit',
				description: 'Kit description',
				source: 'file',
			};
			const mockPlugins = [];

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

			const { result } = renderHook( () => useExportKit( {
				includes: mockIncludes,
				kitInfo: mockKitInfo,
				plugins: mockPlugins,
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			// Wait for the export to complete
			await waitFor( () => {
				expect( mockDispatch ).toHaveBeenCalledWith( {
					type: 'SET_EXPORT_STATUS',
					payload: EXPORT_STATUS.COMPLETED,
				} );
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/export',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': 'wp-nonce',
					},
					body: JSON.stringify( {
						include: mockIncludes,
						kitInfo: {
							title: 'My Kit',
							description: 'Kit description',
							source: 'file',
						},
						plugins: [],
						selectedCustomPostTypes: [],
					} ),
				}
			);

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_EXPORTED_DATA',
				payload: {
					file: 'base64encodedfile',
					manifest: { version: '1.0' },
				},
			} );

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_EXPORT_STATUS',
				payload: EXPORT_STATUS.COMPLETED,
			} );

			expect( window.location.href ).toBe( 'https://example.com#/export-customization/complete' );
		} );

		it( 'should handle whitespace in kit title and description', async () => {
			const mockKitInfo = {
				title: '  My Kit  ',
				description: '  Kit description  ',
				source: 'file',
			};

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

			renderHook( () => useExportKit( {
				includes: [ 'content' ],
				kitInfo: mockKitInfo,
				plugins: [],
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					expect.any( String ),
					expect.objectContaining( {
						body: expect.stringContaining( '"title":"My Kit"' ),
					} )
				);
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: expect.stringContaining( '"title":"My Kit"' ),
				} )
			);

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: expect.stringContaining( '"description":"Kit description"' ),
				} )
			);
		} );
	} );

	describe( 'Export Kit to Cloud', () => {
		it( 'should successfully export kit to cloud with screenshot', async () => {
			const mockKitInfo = {
				title: 'My Cloud Kit',
				description: 'Cloud kit description',
				source: 'cloud',
			};

			const mockScreenshot = 'data:image/png;base64,mockscreenshot';
			generateScreenshot.mockResolvedValue( mockScreenshot );

			const mockResponseData = {
				data: {
					kit: {
						id: 123,
						title: 'My Cloud Kit',
						url: 'https://example.com/kit/123',
					},
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			renderHook( () => useExportKit( {
				includes: [ 'content' ],
				kitInfo: mockKitInfo,
				plugins: [],
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			await waitFor( () => {
				expect( generateScreenshot ).toHaveBeenCalled();
			} );
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/export',
				expect.objectContaining( {
					body: expect.stringContaining( '"screenShotBlob"' ),
				} )
			);

			expect( mockDispatch ).toHaveBeenCalledWith( {
				type: 'SET_EXPORTED_DATA',
				payload: {
					kit: {
						id: 123,
						title: 'My Cloud Kit',
						url: 'https://example.com/kit/123',
					},
				},
			} );
		} );

		it( 'should not generate screenshot when cloud library feature is disabled', async () => {
			mockElementorCommon.config.experimentalFeatures[ 'cloud-library' ] = false;

			const mockKitInfo = {
				title: 'My Cloud Kit',
				source: 'cloud',
			};

			const mockResponseData = {
				data: {
					kit: { id: 123 },
				},
			};

			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( mockResponseData ),
			} );

			renderHook( () => useExportKit( {
				includes: [ 'content' ],
				kitInfo: mockKitInfo,
				plugins: [],
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			await waitFor( () => {
				expect( mockDispatch ).toHaveBeenCalled();
			} );

			expect( generateScreenshot ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Hook Lifecycle', () => {
		it( 'should not export when isExporting is false', async () => {
			const mockKitInfo = {
				title: 'My Kit',
				source: 'file',
			};

			const { result } = renderHook( () => useExportKit( {
				includes: [ 'content' ],
				kitInfo: mockKitInfo,
				plugins: [],
				isExporting: false,
				dispatch: mockDispatch,
			} ) );

			// Give it a moment to potentially run
			await new Promise( resolve => setTimeout( resolve, 10 ) );

			expect( mockFetch ).not.toHaveBeenCalled();
			expect( result.current.status ).toBe( result.current.STATUS_PROCESSING );
		} );

		it( 'should re-export when isExporting changes to true', async () => {
			const mockKitInfo = {
				title: 'My Kit',
				source: 'file',
			};

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

			const { rerender } = renderHook( 
				( { isExporting } ) => useExportKit( {
					includes: [ 'content' ],
					kitInfo: mockKitInfo,
					plugins: [],
					isExporting,
					dispatch: mockDispatch,
				} ),
				{ initialProps: { isExporting: false } }
			);

			// Initially not exporting
			expect( mockFetch ).not.toHaveBeenCalled();

			// Trigger export
			rerender( { isExporting: true } );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledTimes( 1 );
			} );

			expect( mockFetch ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Export Data Validation', () => {
		it( 'should include all required fields in export payload', async () => {
			const mockIncludes = [ 'content', 'templates', 'settings' ];
			const mockKitInfo = {
				title: 'My Kit',
				description: 'Description',
				source: 'file',
			};
			const mockPlugins = [
				{ name: 'plugin1', version: '1.0' },
			];

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

			renderHook( () => useExportKit( {
				includes: mockIncludes,
				kitInfo: mockKitInfo,
				plugins: mockPlugins,
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			const expectedPayload = {
				include: mockIncludes,
				kitInfo: {
					title: 'My Kit',
					description: 'Description',
					source: 'file',
				},
				plugins: mockPlugins,
				selectedCustomPostTypes: [],
			};

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: JSON.stringify( expectedPayload ),
				} )
			);
		} );

		it( 'should handle null kit title and description', async () => {
			const mockKitInfo = {
				title: null,
				description: null,
				source: 'file',
			};

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

			renderHook( () => useExportKit( {
				includes: [ 'content' ],
				kitInfo: mockKitInfo,
				plugins: [],
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalled();
			} );

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: expect.stringContaining( '"title":null' ),
				} )
			);

			expect( mockFetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					body: expect.stringContaining( '"description":null' ),
				} )
			);
		} );
	} );
} );
