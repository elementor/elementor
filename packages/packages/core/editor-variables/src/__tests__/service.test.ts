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

			expect( apiClient.update ).toHaveBeenCalledWith( 'variable-3', 'updated-primary-font', 'Arial' );

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
			expect( apiClient.restore ).toHaveBeenCalledWith( 'variable-3', undefined, undefined );

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
	} );
} );
