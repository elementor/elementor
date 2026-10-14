import { createMockHttpResponse } from 'test-utils';

import { apiClient } from '../api';
import { service } from '../service';
import { type TVariable } from '../storage';

// Mock the API client
jest.mock( '../api' );

// Mock sessionStorage
const mockLocalStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

Object.defineProperty( window, 'localStorage', {
	value: mockLocalStorage,
} );

describe( 'service', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockLocalStorage.getItem.mockReturnValue( null );
	} );

	describe( 'load', () => {
		it( 'should result in filled list of variables', async () => {
			// Arrange.
			jest.mocked( apiClient.list ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						variables: {
							'variable-1': {
								label: 'primary-color',
								value: '#ff0000',
								type: 'global-color-variable',
							},
							'variable-2': {
								label: 'primary-font',
								value: 'Arial',
								type: 'global-font-variable',
							},
						},
						total: 2,
						watermark: 10,
					},
				} )
			);

			// Act.
			const variables = await service.load();

			// Assert.
			const expectedVariables = {
				'variable-1': {
					label: 'primary-color',
					value: '#ff0000',
					type: 'global-color-variable',
				},
				'variable-2': {
					label: 'primary-font',
					value: 'Arial',
					type: 'global-font-variable',
				},
			};

			expect( variables ).toEqual( expectedVariables );

			expect( apiClient.list ).toHaveBeenCalled();

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'elementor-global-variables-watermark', '10' );

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( expectedVariables )
			);
		} );
	} );

	describe( 'create', () => {
		it( 'should add new variable to the list', async () => {
			// Arrange.
			jest.mocked( apiClient.create ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						variable: {
							id: 'variable-3',
							label: 'primary-font',
							value: 'Arial',
							type: 'global-font-variable',
						},
						watermark: 11,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '10';
				}

				if ( key === 'elementor-global-variables' ) {
					return null;
				}

				return null;
			} );

			// Act.
			const result = await service.create( {
				type: 'global-font-variable',
				label: 'primary-font',
				value: 'Arial',
			} );

			// Assert.
			expect( result ).toEqual( {
				id: 'variable-3',
				variable: {
					label: 'primary-font',
					value: 'Arial',
					type: 'global-font-variable',
				},
			} );

			expect( apiClient.create ).toHaveBeenCalledWith( 'global-font-variable', 'primary-font', 'Arial' );

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( {
					'variable-3': {
						label: 'primary-font',
						value: 'Arial',
						type: 'global-font-variable',
					},
				} )
			);

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'elementor-global-variables-watermark', '11' );
		} );
	} );

	describe( 'update', () => {
		it( 'should update existing variable in the list', async () => {
			// Arrange.
			jest.mocked( apiClient.update ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						variable: {
							id: 'variable-3',
							label: 'updated-primary-font',
							value: 'Arial',
							type: 'global-font-variable',
						},
						watermark: 11,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '10';
				}

				if ( key === 'elementor-global-variables' ) {
					return JSON.stringify( {
						'variable-3': {
							type: 'global-font-variable',
							label: 'primary-font',
							value: 'Arial',
						},
					} );
				}

				return null;
			} );

			// Act.
			const changedVariable = {
				type: 'global-font-variable',
				label: 'updated-primary-font',
				value: 'Arial',
			} as TVariable;

			const result = await service.update( 'variable-3', changedVariable );

			// Assert.
			expect( result ).toEqual( {
				id: 'variable-3',
				variable: {
					label: 'updated-primary-font',
					value: 'Arial',
					type: 'global-font-variable',
				},
			} );

			expect( apiClient.update ).toHaveBeenCalledWith(
				'variable-3',
				'updated-primary-font',
				'Arial',
				'global-font-variable'
			);

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( {
					'variable-3': {
						label: 'updated-primary-font',
						value: 'Arial',
						type: 'global-font-variable',
					},
				} )
			);

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'elementor-global-variables-watermark', '11' );
		} );

		it( 'should pass type in payload when type is changed', async () => {
			// Arrange.
			jest.mocked( apiClient.update ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: { watermark: 11, variable: {} },
				} )
			);

			// Act.
			await service.update( 'size-variable', {
				type: 'global-custom-size-variable',
				label: 'updated-custom-size',
				value: 'clamp(9rem, 4rem, 5px)',
			} );

			// Assert.
			expect( apiClient.update ).toHaveBeenCalledWith(
				'size-variable',
				'updated-custom-size',
				'clamp(9rem, 4rem, 5px)',
				'global-custom-size-variable'
			);
		} );
	} );

	describe( 'delete', () => {
		it( 'should update the variable in the list based on server response', async () => {
			// Arrange.
			jest.mocked( apiClient.delete ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						variable: {
							id: 'variable-3',
							label: 'primary-font',
							value: 'Arial',
							type: 'global-font-variable',
							deleted: true,
							deleted_at: '2021-01-01 00:00:00',
						},
						watermark: 20,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '19';
				}

				if ( key === 'elementor-global-variables' ) {
					return JSON.stringify( {
						'variable-3': {
							type: 'global-font-variable',
							label: 'primary-font',
							value: 'Arial',
						},
					} );
				}

				return null;
			} );

			// Act.
			const result = await service.delete( 'variable-3' );

			// Assert.
			expect( apiClient.delete ).toHaveBeenCalledWith( 'variable-3' );

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( {
					'variable-3': {
						label: 'primary-font',
						value: 'Arial',
						type: 'global-font-variable',
						deleted: true,
						deleted_at: '2021-01-01 00:00:00',
					},
				} )
			);

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'elementor-global-variables-watermark', '20' );

			expect( result ).toEqual( {
				id: 'variable-3',
				variable: {
					label: 'primary-font',
					value: 'Arial',
					type: 'global-font-variable',
					deleted: true,
					deleted_at: '2021-01-01 00:00:00',
				},
			} );
		} );
	} );

	describe( 'batchSave', () => {
		it( 'should store updated variables with correct IDs', async () => {
			// Arrange
			jest.mocked( apiClient.batch ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						results: [
							{
								type: 'update',
								id: 'var-1',
								variable: {
									label: 'Primary',
									value: '#ff0000',
									type: 'global-color-variable',
									sync_to_v3: true,
								},
							},
						],
						watermark: 12,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '11';
				}

				if ( key === 'elementor-global-variables' ) {
					return JSON.stringify( {
						'var-1': {
							label: 'Primary',
							value: '#ff0000',
							type: 'global-color-variable',
						},
					} );
				}

				return null;
			} );

			const original: Record< string, TVariable > = {
				'var-1': { label: 'Primary', value: '#ff0000', type: 'global-color-variable' },
			};

			const current: Record< string, TVariable > = {
				'var-1': { label: 'Primary', value: '#ff0000', type: 'global-color-variable', sync_to_v3: true },
			};

			// Act
			await service.batchSave( original, current, [] );

			// Assert
			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( {
					'var-1': {
						label: 'Primary',
						value: '#ff0000',
						type: 'global-color-variable',
						sync_to_v3: true,
					},
				} )
			);
		} );

		it( 'should handle multiple operations in a single batch', async () => {
			// Arrange
			jest.mocked( apiClient.batch ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						results: [
							{
								type: 'update',
								id: 'var-1',
								variable: {
									label: 'Primary',
									value: '#ff0000',
									type: 'global-color-variable',
									sync_to_v3: true,
								},
							},
							{
								type: 'update',
								id: 'var-2',
								variable: {
									label: 'Secondary',
									value: '#00ff00',
									type: 'global-color-variable',
								},
							},
						],
						watermark: 13,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '12';
				}

				if ( key === 'elementor-global-variables' ) {
					return JSON.stringify( {
						'var-1': { label: 'Primary', value: '#ff0000', type: 'global-color-variable' },
						'var-2': { label: 'Secondary', value: '#0000ff', type: 'global-color-variable' },
					} );
				}

				return null;
			} );

			const original: Record< string, TVariable > = {
				'var-1': { label: 'Primary', value: '#ff0000', type: 'global-color-variable' },
				'var-2': { label: 'Secondary', value: '#0000ff', type: 'global-color-variable' },
			};

			const current: Record< string, TVariable > = {
				'var-1': { label: 'Primary', value: '#ff0000', type: 'global-color-variable', sync_to_v3: true },
				'var-2': { label: 'Secondary', value: '#00ff00', type: 'global-color-variable' },
			};

			// Act
			const result = await service.batchSave( original, current, [] );

			// Assert
			expect( result.success ).toBe( true );

			const storedVars = JSON.parse(
				mockLocalStorage.setItem.mock.calls
					.filter( ( [ key ]: string[] ) => key === 'elementor-global-variables' )
					.pop()?.[ 1 ] || '{}'
			);

			expect( storedVars ).toHaveProperty( 'var-1' );
			expect( storedVars ).toHaveProperty( 'var-2' );
			expect( storedVars ).not.toHaveProperty( 'undefined' );
		} );

		it( 'should not call API when there are no operations', async () => {
			// Arrange
			const variables: Record< string, TVariable > = {
				'var-1': { label: 'Same', value: '#000', type: 'global-color-variable' },
			};

			// Act
			const result = await service.batchSave( variables, variables, [] );

			// Assert
			expect( apiClient.batch ).not.toHaveBeenCalled();
			expect( result.success ).toBe( true );
			expect( result.operations ).toBe( 0 );
		} );
	} );

	describe( 'restore', () => {
		it( 'should restore the variable in the list based on server response', async () => {
			// Arrange.
			jest.mocked( apiClient.restore ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: {
						variable: {
							id: 'variable-3',
							label: 'primary-font',
							value: 'Arial',
							type: 'global-font-variable',
						},
						watermark: 30,
					},
				} )
			);

			mockLocalStorage.getItem.mockImplementation( ( key ) => {
				if ( key === 'elementor-global-variables-watermark' ) {
					return '29';
				}

				if ( key === 'elementor-global-variables' ) {
					return JSON.stringify( {
						'variable-3': {
							type: 'global-font-variable',
							label: 'primary-font',
							value: 'Arial',
							deleted: true,
							deleted_at: '2021-01-01 00:00:00',
						},
					} );
				}

				return null;
			} );

			// Act.
			const result = await service.restore( 'variable-3' );

			// Assert.
			expect( apiClient.restore ).toHaveBeenCalledWith( 'variable-3', undefined, undefined, undefined );

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith(
				'elementor-global-variables',
				JSON.stringify( {
					'variable-3': {
						label: 'primary-font',
						value: 'Arial',
						type: 'global-font-variable',
					},
				} )
			);

			expect( mockLocalStorage.setItem ).toHaveBeenCalledWith( 'elementor-global-variables-watermark', '30' );

			expect( result ).toEqual( {
				id: 'variable-3',
				variable: {
					label: 'primary-font',
					value: 'Arial',
					type: 'global-font-variable',
				},
			} );
		} );

		it( 'should pass type in payload when restoring with a changed type', async () => {
			// Arrange.
			jest.mocked( apiClient.restore ).mockResolvedValue(
				createMockHttpResponse( {
					success: true,
					data: { watermark: 31, variable: {} },
				} )
			);

			// Act.
			await service.restore( 'variable-3', 'size', '12px', 'global-size-variable' );

			// Assert.
			expect( apiClient.restore ).toHaveBeenCalledWith( 'variable-3', 'size', '12px', 'global-size-variable' );
		} );
	} );
} );
