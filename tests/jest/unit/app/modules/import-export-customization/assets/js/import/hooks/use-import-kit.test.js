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

	it( 'should have correct initial state', () => {
		// Arrange
		setupContext();
		// Act
		const { result } = renderHook( () => useImportKit() );
		// Assert
		expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.PENDING );
		expect( result.current.error ).toBe( null );
		expect( result.current.runnersState ).toEqual( {} );
	} );

	it( 'should call importKit and dispatch SET_IMPORTED_DATA on success', async () => {
		// Arrange
		const kitUploadParams = { id: 1, referrer: 'test' };
		const uploadedData = { session: 'abc' };
		const includes = [ 'content' ];
		setupContext( {
			isProcessing: true,
			data: { kitUploadParams, uploadedData, includes },
		} );
		const mockResponseData = { data: { imported: true } };
		mockFetch.mockResolvedValueOnce( {
			ok: true,
			json: jest.fn().mockResolvedValue( mockResponseData ),
		} );
		// Act
		renderHook( () => useImportKit() );
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
		setupContext( {
			isProcessing: true,
			data: { kitUploadParams, uploadedData, includes },
		} );
		mockFetch.mockRejectedValueOnce( new Error( 'Import error' ) );
		// Act
		const { result } = renderHook( () => useImportKit() );
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
		setupContext( {
			isProcessing: true,
			data: { importedData, includes: [ 'content' ] },
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
		const { result } = renderHook( () => useImportKit() );
		// Assert
		await waitFor( () => {
			expect( result.current.runnersState.plugin1 ).toBe( 'ok' );
			expect( result.current.runnersState.plugin2 ).toBe( 'ok' );
			expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.DONE );
			expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'COMPLETED' } );
		} );
	} );

	it( 'should set error and stop runners on runner error', async () => {
		// Arrange
		const importedData = { session: 'abc', runners: [ 'plugin1', 'plugin2' ] };
		setupContext( {
			isProcessing: true,
			data: { importedData, includes: [ 'content' ] },
		} );
		// First runner fails
		mockFetch.mockRejectedValueOnce( new Error( 'Runner error' ) );
		// Act
		const { result } = renderHook( () => useImportKit() );
		// Assert
		await waitFor( () => {
			expect( result.current.error ).toBeInstanceOf( Error );
			expect( result.current.error.message ).toBe( 'Runner error' );
			expect( result.current.status ).toBe( IMPORT_PROCESSING_STATUS.DONE );
		} );
	} );
} );
