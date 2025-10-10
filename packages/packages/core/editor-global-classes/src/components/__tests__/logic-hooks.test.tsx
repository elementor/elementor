import * as React from 'react';
import { createMockHttpResponse, createMockStyleDefinition, renderWithStore } from 'test-utils';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { waitFor } from '@testing-library/react';

import { apiClient, type GlobalClassesGetAllResponse } from '../../api';
import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { slice } from '../../store';
import { PopulateStore } from '../populate-store';

jest.mock( '../../api', () => ( {
	apiClient: {
		all: jest.fn(),
	},
} ) );

describe( '<LogicHooks />', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		registerSlice( slice );
		store = createStore();
	} );

	it( 'should load all classes on mount', async () => {
		// Arrange
		const subscriber = jest.fn();

		globalClassesStylesProvider.subscribe( subscriber );

		const globalClass1 = createMockStyleDefinition( { id: 'global-1' } );
		const globalClass2 = createMockStyleDefinition( { id: 'global-2' } );

		const mockResponse = createMockHttpResponse< GlobalClassesGetAllResponse >( {
			data: {
				'global-1': globalClass1,
				'global-2': globalClass2,
			},
			meta: { order: [ 'global-2', 'global-1' ] },
		} );

		jest.mocked( apiClient.all ).mockResolvedValue( mockResponse );

		// Act
		renderWithStore( <PopulateStore />, store );

		// Assert
		await waitFor( () => {
			expect( subscriber ).toHaveBeenCalledTimes( 1 );
		} );

		expect( globalClassesStylesProvider.actions.all() ).toEqual( [ globalClass2, globalClass1 ] );
	} );
} );
