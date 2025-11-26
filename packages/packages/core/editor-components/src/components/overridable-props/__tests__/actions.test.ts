// [Found-Testing-Reference===> REDUX,ASYNC,HTTP]
import { type AxiosResponse } from '@elementor/http-client';
import { __getState as getState } from '@elementor/store';

import { apiClient } from '../../../api';
import { selectOverridableProps } from '../../../store/store';
import { type OverridableProps } from '../../../types';
import { overrideActions } from '../utils/actions';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
} ) );

jest.mock( '../../../api', () => ( {
	apiClient: {
		setOverrideProps: jest.fn(),
		getOverrideProps: jest.fn(),
	},
} ) );

jest.mock( '../../../store/store', () => ( {
	...jest.requireActual( '../../../store/store' ),
	selectOverridableProps: jest.fn(),
} ) );

describe( 'overrideActions', () => {
	const mockGetState = jest.mocked( getState );
	const mockSelectOverridableProps = jest.mocked( selectOverridableProps );
	const mockSetOverrideProps = jest.mocked( apiClient.setOverrideProps );
	const mockGetOverrideProps = jest.mocked( apiClient.getOverrideProps );

	const componentId = 123;
	const mockState = {};

	const mockOverridableProps: OverridableProps = {
		props: {
			'prop-1': {
				'override-key': 'key-1',
				label: 'Test Prop 1',
				elementId: 'element-1',
				propKey: 'color',
				widgetType: 'button',
				defaultValue: '#ff0000',
				groupId: 'group-1',
			},
		},
		groups: {
			items: {
				'group-1': {
					id: 'group-1',
					label: 'Test Group',
					props: [ 'prop-1' ],
				},
			},
			order: [ 'group-1' ],
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetState.mockReturnValue( mockState );
	} );

	it( 'should call setOverrideProps when componentOverrides exist in save', () => {
		// Arrange
		mockSelectOverridableProps.mockReturnValue( mockOverridableProps );
		mockSetOverrideProps.mockResolvedValue( {
			data: { data: {} },
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {},
		} as AxiosResponse );

		// Act
		overrideActions.save( componentId );

		// Assert
		expect( mockGetState ).toHaveBeenCalledTimes( 1 );
		expect( mockSelectOverridableProps ).toHaveBeenCalledWith( mockState, componentId );
		expect( mockSetOverrideProps ).toHaveBeenCalledWith( componentId, mockOverridableProps );
	} );

	it( 'should return early when componentOverrides are undefined in save', () => {
		// Arrange
		mockSelectOverridableProps.mockReturnValue( undefined );

		// Act
		overrideActions.save( componentId );

		// Assert
		expect( mockGetState ).toHaveBeenCalledTimes( 1 );
		expect( mockSelectOverridableProps ).toHaveBeenCalledWith( mockState, componentId );
		expect( mockSetOverrideProps ).not.toHaveBeenCalled();
	} );

	it( 'should return early when componentOverrides are null in save', () => {
		// Arrange
		mockSelectOverridableProps.mockReturnValue( null as unknown as OverridableProps );

		// Act
		overrideActions.save( componentId );

		// Assert
		expect( mockGetState ).toHaveBeenCalledTimes( 1 );
		expect( mockSelectOverridableProps ).toHaveBeenCalledWith( mockState, componentId );
		expect( mockSetOverrideProps ).not.toHaveBeenCalled();
	} );

	it( 'should call getOverrideProps and return the result in load', async () => {
		// Arrange
		const mockResponse = { data: mockOverridableProps };
		mockGetOverrideProps.mockResolvedValue( mockResponse );

		// Act
		const result = await overrideActions.load( componentId );

		// Assert
		expect( mockGetOverrideProps ).toHaveBeenCalledWith( componentId );
		expect( result ).toEqual( mockResponse );
	} );

	it( 'should handle API errors gracefully in load', async () => {
		// Arrange
		const mockError = new Error( 'API Error' );
		mockGetOverrideProps.mockRejectedValue( mockError );

		// Act & Assert
		await expect( overrideActions.load( componentId ) ).rejects.toThrow( 'API Error' );
		expect( mockGetOverrideProps ).toHaveBeenCalledWith( componentId );
	} );
} );
