import { createMockStyleDefinitionWithVariants } from 'test-utils';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getState as getState,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { apiClient } from '../api';
import { loadDefaultStyles } from '../load-default-styles';
import { selectData, slice } from '../store';

jest.mock( '../api' );

describe( 'loadDefaultStyles', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'should load styles into the store', async () => {
		const style = createMockStyleDefinitionWithVariants( {
			id: 'h1',
			variants: [
				{
					meta: { breakpoint: 'desktop', state: null },
					props: { color: 'red' },
					custom_css: null,
				},
			],
		} );

		jest.mocked( apiClient.all ).mockResolvedValue( {
			data: { data: { h1: style } },
		} as never );

		await loadDefaultStyles();

		expect( selectData( getState() ) ).toEqual( { h1: style } );
	} );

	it( 'should not throw when the API request fails', async () => {
		jest.mocked( apiClient.all ).mockRejectedValue( new Error( 'Forbidden' ) );

		await expect( loadDefaultStyles() ).resolves.toBeUndefined();
		expect( selectData( getState() ) ).toEqual( {} );
	} );
} );
