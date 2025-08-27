import { renderHook, waitFor } from '@testing-library/react';
import { useImportKit, IMPORT_PROCESSING_STATUS } from 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-import-kit';

const mockDispatch = jest.fn();
const mockUseImportContext = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	...jest.requireActual( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context' ),
	useImportContext: () => mockUseImportContext(),
} ) );

describe( 'useImportKit Hook', () => {
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

	function setupContext( {
		isProcessing = false,
		data = {},
	} = {} ) {
		mockUseImportContext.mockReturnValue( {
			data,
			isProcessing,
			dispatch: mockDispatch,
		} );
	}

	function createHookParams( overrides = {} ) {
		return {
			data: {},
			includes: [],
			customization: {},
			isProcessing: false,
			dispatch: mockDispatch,
			...overrides,
		};
	}

	it( 'should have correct initial state', () => {
		// Arrange
		setupContext();
		const hookParams = createHookParams();
		// Act
		const { result } = renderHook( () => useImportKit( hookParams ) );
		// Assert
		expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.PENDING );
		expect( result.current.error ).toBe( null );
	} );

	it( 'should call importKit and dispatch SET_IMPORTED_DATA on success', async () => {
		// Arrange
		const kitUploadParams = { id: 1, referrer: 'test' };
		const uploadedData = { session: 'abc' };
		const includes = [ 'content' ];
		const data = { kitUploadParams, uploadedData, includes };
		setupContext( {
			isProcessing: true,
			data,
		} );
		const hookParams = createHookParams( {
			data,
			includes,
			isProcessing: true,
		} );
		const mockResponseData = { data: { imported: true } };
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( mockResponseData ),
		} );
		// Act
		renderHook( () => useImportKit( hookParams ) );
		// Assert
		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/import',
				expect.objectContaining( {
					method: 'POST',
					headers: expect.objectContaining( { 'X-WP-Nonce': 'wp-nonce' } ),
				} ),
			);
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORTED_DATA', payload: { imported: true } } );
		} );
	} );

	it( 'should set error and status DONE on importKit error', async () => {
		// Arrange
		const kitUploadParams = { id: 1, referrer: 'test' };
		const uploadedData = { session: 'abc' };
		const includes = [ 'content' ];
		const data = { kitUploadParams, uploadedData, includes };
		setupContext( {
			isProcessing: true,
			data,
		} );
		const hookParams = createHookParams( {
			data,
			includes,
			isProcessing: true,
		} );
		mockFetch.mockRejectedValueOnce( new Error( 'Import error' ) );
		// Act
		const { result } = renderHook( () => useImportKit( hookParams ) );
		// Assert
		await waitFor( () => {
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.error.message ).toBe( 'Import error' );
			expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.DONE );
		} );
	} );

	it( 'should run import runners and update runnersState', async () => {
		// Arrange
		const importedData = { session: 'abc', runners: [ 'plugin1', 'plugin2' ] };
		const includes = [ 'content' ];
		const data = { importedData, includes, uploadedData: { session: 'abc' } };
		setupContext( {
			isProcessing: true,
			data,
		} );
		const hookParams = createHookParams( {
			data,
			includes,
			isProcessing: true,
		} );

		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( { data: { imported_data: importedData } } ),
		} );

		// First runner
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( { data: { imported_data: { plugin1: 'ok' } } } ),
		} );
		// Second runner
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( { data: { imported_data: { plugin2: 'ok' } } } ),
		} );
		// Act
		const { result } = renderHook( () => useImportKit( hookParams ) );
		// Assert
		await waitFor( () => {
			expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.DONE );
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_RUNNERS_STATE', payload: { plugin1: 'ok' } } );
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_RUNNERS_STATE', payload: { plugin2: 'ok' } } );
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'COMPLETED' } );
		} );
	} );

	it( 'should set error and stop runners on runner error', async () => {
		// Arrange
		const importedData = { session: 'abc', runners: [ 'plugin1', 'plugin2' ] };
		const includes = [ 'content' ];
		const data = { importedData, includes };
		setupContext( {
			isProcessing: true,
			data,
		} );
		const hookParams = createHookParams( {
			data,
			includes,
			isProcessing: true,
		} );
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( { data: { imported_data: importedData } } ),
		} );

		// First runner fails
		mockFetch.mockRejectedValueOnce( new Error( 'Runner error' ) );
		// Act
		const { result } = renderHook( () => useImportKit( hookParams ) );
		// Assert
		await waitFor( () => {
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.error.message ).toBe( 'Runner error' );
			expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.DONE );
		} );
	} );
} );
