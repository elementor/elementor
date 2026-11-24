import { renderHookWithQuery } from 'test-utils';
import { waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { useSiteContentStatusFilterCounts } from '../use-site-content-status-filter-counts';

jest.mock( '@wordpress/api-fetch' );

const totalResponse = ( total: number ) => ( {
	json: () => Promise.resolve( [] ),
	headers: {
		get: ( header: string ) => ( 'x-wp-total' === header ? String( total ) : '1' ),
	},
} );

const requestPath = ( options: unknown ): string => {
	if ( options && 'object' === typeof options && 'path' in options ) {
		return String( options.path );
	}

	return '';
};

describe( '@elementor/editor-site-navigation/use-site-content-status-filter-counts', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps successful status counts when one status request fails', async () => {
		// Arrange.
		jest.mocked( apiFetch ).mockImplementation( ( options ) => {
			const path = requestPath( options );

			if ( path.includes( 'status=trash' ) ) {
				return Promise.reject( new Error( 'trash count failed' ) );
			}

			if ( path.includes( 'status=publish' ) ) {
				return Promise.resolve( totalResponse( 4 ) );
			}

			return Promise.resolve( totalResponse( 0 ) );
		} );

		// Act.
		const { component } = renderHookWithQuery( () => useSiteContentStatusFilterCounts( [ 'page' ], true ) );

		// Assert.
		await waitFor( () => expect( component.result.current.isSuccess ).toBe( true ) );

		expect( component.result.current.isError ).toBe( false );
		expect( component.result.current.data?.publish ).toBe( 4 );
		expect( component.result.current.data?.trash ).toBeUndefined();
	} );
} );
