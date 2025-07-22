import { renderHook, waitFor } from '@testing-library/react';
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

		delete window.location;
		window.location = { href: '' };

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

			renderHook( () => useExportKit( {
				includes: mockIncludes,
				kitInfo: mockKitInfo,
				plugins: mockPlugins,
				isExporting: true,
				dispatch: mockDispatch,
			} ) );

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
						kitInfo: {
							title: 'My Kit',
							description: 'Kit description',
							source: 'file',
						},
						include: mockIncludes,
					} ),
				},
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
				} ),
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
	} );
} );
