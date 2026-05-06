import { httpService } from '@elementor/http-client';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useQueryAutocomplete } from '../use-query-autocomplete';

jest.mock( '@elementor/http-client' );

const flatResponse = {
	value: [
		{ id: 1, label: 'Apple' },
		{ id: 2, label: 'Banana' },
		{ id: 3, label: 'Cherry' },
	],
};

describe( 'useQueryAutocomplete', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		jest.mocked( httpService ).mockReturnValue( {
			// @ts-expect-error - partial mock
			get: async () => ( { data: { data: flatResponse } } ),
		} );
	} );

	it( 'seeds initial option from existing query value', () => {
		// Arrange.
		const initialQueryValue = {
			id: { $$type: 'number', value: 42 },
			label: { $$type: 'string', value: 'Existing' },
		} as never;

		// Act.
		const { result } = renderHook( () =>
			useQueryAutocomplete( { url: '/api', initialQueryValue, minInputLength: 2 } )
		);

		// Assert.
		expect( result.current.options ).toEqual( [ { id: '42', label: 'Existing' } ] );
	} );

	it( 'returns empty options when no initial value', () => {
		// Act.
		const { result } = renderHook( () => useQueryAutocomplete( { url: '/api', initialQueryValue: null } ) );

		// Assert.
		expect( result.current.options ).toEqual( [] );
	} );

	it( 'does not fetch when input is shorter than minInputLength', async () => {
		// Act.
		const { result } = renderHook( () => useQueryAutocomplete( { url: '/api', minInputLength: 3 } ) );

		act( () => result.current.updateOptions( 'ap' ) );

		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

		// Assert.
		expect( httpService ).not.toHaveBeenCalled();
	} );

	it( 'fetches, sorts and filters out excluded ids', async () => {
		// Act.
		const { result } = renderHook( () =>
			useQueryAutocomplete( { url: '/api', minInputLength: 1, excludeIds: [ 2 ] } )
		);

		act( () => result.current.updateOptions( 'a' ) );

		// Assert.
		await waitFor(
			() => {
				expect( result.current.options ).toEqual( [
					{ id: 1, label: 'Apple' },
					{ id: 3, label: 'Cherry' },
				] );
			},
			{ timeout: 1000 }
		);
	} );
} );
