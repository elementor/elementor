import { renderHook, waitFor } from '@testing-library/react';
import { useUploadKit } from 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-upload-kit';

const mockDispatch = jest.fn();
const mockFile = new File( [ 'dummy content' ], 'kit.zip', { type: 'application/zip' } );

const mockUseImportContext = jest.fn();
jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
} ) );

describe( 'useUploadKit Hook', () => {
	let mockFetch;
	let mockElementorAppConfig;
	let mockWpApiSettings;

	beforeEach( () => {
		mockFetch = jest.fn();
		global.fetch = mockFetch;
		mockDispatch.mockClear();

		mockElementorAppConfig = {
			'import-export-customization': {
				restApiBaseUrl: 'https://example.com/wp-json/elementor/v1',
			},
		};
		global.elementorAppConfig = mockElementorAppConfig;
		mockWpApiSettings = { nonce: 'wp-nonce' };
		window.wpApiSettings = mockWpApiSettings;
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	function setupContext( { isUploading = false, file = mockFile } = {} ) {
		mockUseImportContext.mockReturnValue( {
			data: { file },
			isUploading,
			dispatch: mockDispatch,
		} );
	}

	it( 'should upload file and dispatch SET_UPLOADED_DATA on success', async () => {
		// Arrange
		setupContext( { isUploading: true } );
		const mockResponseData = { data: { uploaded: true, id: 123 } };
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( mockResponseData ),
		} );

		// Act
		const { result } = renderHook( () => useUploadKit() );

		// Assert
		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/upload',
				expect.objectContaining( {
					method: 'POST',
					headers: expect.objectContaining( { 'X-WP-Nonce': 'wp-nonce' } ),
				} ),
			);
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_UPLOADED_DATA', payload: { uploaded: true, id: 123 } } );
			expect( result.current.uploading ).toBe( false );
			expect( result.current.error ).toBe( null );
		} );
	} );

	it( 'should set error state on failed upload (non-OK response)', async () => {
		// Arrange
		setupContext( { isUploading: true } );
		const mockResponseData = { data: { message: 'Upload failed', code: 'upload_error' } };
		mockFetch.mockResolvedValueOnce( {
			ok: false,
			json: jest.fn().mockResolvedValue( mockResponseData ),
		} );

		// Act
		const { result } = renderHook( () => useUploadKit() );

		// Assert
		await waitFor( () => {
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.error.message ).toBe( 'Upload failed' );
			expect( result.current.uploading ).toBe( false );
		} );
	} );

	it( 'should set error state on fetch/network error', async () => {
		// Arrange
		setupContext( { isUploading: true } );
		mockFetch.mockRejectedValueOnce( new Error( 'Network error' ) );

		// Act
		const { result } = renderHook( () => useUploadKit() );

		// Assert
		await waitFor( () => {
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.error.message ).toBe( 'Network error' );
			expect( result.current.uploading ).toBe( false );
		} );
	} );

	it( 'should set uploading state correctly during upload', async () => {
		// Arrange
		setupContext( { isUploading: true } );
		let resolveFetch;
		const fetchPromise = new Promise( ( resolve ) => {
			resolveFetch = resolve;
		} );
		mockFetch.mockReturnValue( fetchPromise );

		// Act
		const { result } = renderHook( () => useUploadKit() );

		// Assert
		expect( result.current.uploading ).toBe( true );
		resolveFetch( { ok: true, json: jest.fn().mockResolvedValue( { data: {} } ) } );
		await waitFor( () => {
			expect( result.current.uploading ).toBe( false );
		} );
	} );
} );
