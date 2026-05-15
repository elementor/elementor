import { renderHook, waitFor, act } from '@testing-library/react';
import { useClassesVariablesLimits } from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-classes-variables-limits';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe( 'useClassesVariablesLimits Hook', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		global.window.wpApiSettings = {
			root: 'https://example.com/wp-json/',
			nonce: 'test-nonce',
		};

		global.window.elementorAppConfig = undefined;
	} );

	afterEach( () => {
		jest.clearAllMocks();
		global.window.elementorAppConfig = undefined;
	} );

	describe( 'Initial State', () => {
		it( 'should return default values when not open', () => {
			// Arrange & Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: true } ),
			);

			// Assert
			expect( result.current.existingClassesCount ).toBe( 0 );
			expect( result.current.existingVariablesCount ).toBe( 0 );
			expect( result.current.classesLimit ).toBe( 100 );
			expect( result.current.variablesLimit ).toBe( 100 );
			expect( result.current.isLoading ).toBe( false );
			expect( result.current.error ).toBeNull();
		} );

		it( 'should return default values when not in import mode', () => {
			// Arrange & Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: false } ),
			);

			// Assert
			expect( result.current.existingClassesCount ).toBe( 0 );
			expect( result.current.existingVariablesCount ).toBe( 0 );
			expect( result.current.isLoading ).toBe( false );
		} );

		it( 'should use limits from config when available', () => {
			// Arrange
			global.window.elementorAppConfig = {
				'import-export-customization': {
					limits: {
						classes: 200,
						variables: 150,
					},
				},
			};

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: true } ),
			);

			// Assert
			expect( result.current.classesLimit ).toBe( 200 );
			expect( result.current.variablesLimit ).toBe( 150 );
		} );

		it( 'should fallback to default limits when config is missing', () => {
			// Arrange
			global.window.elementorAppConfig = {
				'import-export-customization': {},
			};

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: true } ),
			);

			// Assert
			expect( result.current.classesLimit ).toBe( 100 );
			expect( result.current.variablesLimit ).toBe( 100 );
		} );
	} );

	describe( 'Fetching Data', () => {
		it( 'should fetch classes and variables counts when open and in import mode', async () => {
			// Arrange
			mockFetch
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( {
						data: {
							'class-1': {},
							'class-2': {},
							'class-3': {},
						},
					} ),
				} )
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( {
						data: {
							total: 5,
						},
					} ),
				} );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( result.current.existingClassesCount ).toBe( 3 );
				expect( result.current.existingVariablesCount ).toBe( 5 );
			} );

			expect( mockFetch ).toHaveBeenCalledTimes( 2 );
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/global-classes',
				expect.objectContaining( {
					headers: {
						'X-WP-Nonce': 'test-nonce',
					},
				} ),
			);
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://example.com/wp-json/elementor/v1/variables/list',
				expect.objectContaining( {
					headers: {
						'X-WP-Nonce': 'test-nonce',
					},
				} ),
			);
		} );

		it( 'should handle fetch errors gracefully', async () => {
			// Arrange
			const mockError = new Error( 'Network error' );
			mockFetch.mockRejectedValue( mockError );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( result.current.error ).toBe( mockError );
			} );

			expect( result.current.isLoading ).toBe( false );
			expect( result.current.existingClassesCount ).toBe( 0 );
			expect( result.current.existingVariablesCount ).toBe( 0 );
		} );

		it( 'should handle non-ok response for classes', async () => {
			// Arrange
			mockFetch
				.mockResolvedValueOnce( {
					ok: false,
				} )
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( {
						data: { total: 10 },
					} ),
				} );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( result.current.existingVariablesCount ).toBe( 10 );
			} );

			expect( result.current.existingClassesCount ).toBe( 0 );
		} );

		it( 'should handle non-ok response for variables', async () => {
			// Arrange
			mockFetch
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( {
						data: { 'class-1': {}, 'class-2': {} },
					} ),
				} )
				.mockResolvedValueOnce( {
					ok: false,
				} );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( result.current.existingClassesCount ).toBe( 2 );
			} );

			expect( result.current.existingVariablesCount ).toBe( 0 );
		} );

		it( 'should use default base URL when wpApiSettings.root is not available', async () => {
			// Arrange
			global.window.wpApiSettings = { nonce: 'test-nonce' };

			mockFetch
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( { data: {} } ),
				} )
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( { data: { total: 0 } } ),
				} );

			// Act
			renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledWith(
					'/wp-json/elementor/v1/global-classes',
					expect.any( Object ),
				);
			} );
		} );

		it( 'should handle missing data in response', async () => {
			// Arrange
			mockFetch
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( {} ),
				} )
				.mockResolvedValueOnce( {
					ok: true,
					json: jest.fn().mockResolvedValue( { data: {} } ),
				} );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert
			await waitFor( () => {
				expect( result.current.isLoading ).toBe( false );
			} );

			expect( result.current.existingClassesCount ).toBe( 0 );
			expect( result.current.existingVariablesCount ).toBe( 0 );
		} );
	} );

	describe( 'calculateLimitInfo', () => {
		it( 'should calculate limit info when not exceeded', () => {
			// Arrange
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: false } ),
			);

			// Act
			const limitInfo = result.current.calculateLimitInfo( 50, 30, 100 );

			// Assert
			expect( limitInfo.isExceeded ).toBe( false );
			expect( limitInfo.overLimitCount ).toBe( 0 );
			expect( limitInfo.totalAfterImport ).toBe( 80 );
		} );

		it( 'should calculate limit info when exactly at limit', () => {
			// Arrange
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: false } ),
			);

			// Act
			const limitInfo = result.current.calculateLimitInfo( 70, 30, 100 );

			// Assert
			expect( limitInfo.isExceeded ).toBe( false );
			expect( limitInfo.overLimitCount ).toBe( 0 );
			expect( limitInfo.totalAfterImport ).toBe( 100 );
		} );

		it( 'should calculate limit info when exceeded', () => {
			// Arrange
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: false } ),
			);

			// Act
			const limitInfo = result.current.calculateLimitInfo( 80, 50, 100 );

			// Assert
			expect( limitInfo.isExceeded ).toBe( true );
			expect( limitInfo.overLimitCount ).toBe( 30 );
			expect( limitInfo.totalAfterImport ).toBe( 130 );
		} );

		it( 'should handle zero existing count', () => {
			// Arrange
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: false } ),
			);

			// Act
			const limitInfo = result.current.calculateLimitInfo( 0, 150, 100 );

			// Assert
			expect( limitInfo.isExceeded ).toBe( true );
			expect( limitInfo.overLimitCount ).toBe( 50 );
			expect( limitInfo.totalAfterImport ).toBe( 150 );
		} );

		it( 'should handle zero imported count', () => {
			// Arrange
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: false, isImport: false } ),
			);

			// Act
			const limitInfo = result.current.calculateLimitInfo( 50, 0, 100 );

			// Assert
			expect( limitInfo.isExceeded ).toBe( false );
			expect( limitInfo.overLimitCount ).toBe( 0 );
			expect( limitInfo.totalAfterImport ).toBe( 50 );
		} );
	} );

	describe( 'Loading State', () => {
		it( 'should set isLoading to true while fetching', async () => {
			// Arrange
			let resolveClasses;
			let resolveVariables;

			mockFetch
				.mockImplementationOnce( () => new Promise( ( resolve ) => {
					resolveClasses = resolve;
				} ) )
				.mockImplementationOnce( () => new Promise( ( resolve ) => {
					resolveVariables = resolve;
				} ) );

			// Act
			const { result } = renderHook( () =>
				useClassesVariablesLimits( { open: true, isImport: true } ),
			);

			// Assert - initially loading
			await waitFor( () => {
				expect( result.current.isLoading ).toBe( true );
			} );

			// Resolve promises
			await act( async () => {
				resolveClasses( { ok: true, json: () => Promise.resolve( { data: {} } ) } );
				resolveVariables( { ok: true, json: () => Promise.resolve( { data: { total: 0 } } ) } );
			} );

			// Assert - loading finished
			await waitFor( () => {
				expect( result.current.isLoading ).toBe( false );
			} );
		} );
	} );

	describe( 'Re-fetching on Props Change', () => {
		it( 'should re-fetch when open changes from false to true', async () => {
			// Arrange
			mockFetch
				.mockResolvedValue( {
					ok: true,
					json: jest.fn().mockResolvedValue( { data: {} } ),
				} );

			const { rerender } = renderHook(
				( { open, isImport } ) => useClassesVariablesLimits( { open, isImport } ),
				{ initialProps: { open: false, isImport: true } },
			);

			// Assert - no fetch when closed
			expect( mockFetch ).not.toHaveBeenCalled();

			// Act - open the dialog
			rerender( { open: true, isImport: true } );

			// Assert - fetch called
			await waitFor( () => {
				expect( mockFetch ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );
} );
