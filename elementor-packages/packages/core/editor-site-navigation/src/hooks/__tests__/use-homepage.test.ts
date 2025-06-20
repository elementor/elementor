import { renderHookWithQuery } from 'test-utils';
import { waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { useHomepage } from '../use-homepage';

jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/site-settings/use-homepage', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( [] ) );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'useHomepage hook should return homepage settings', async () => {
		// Arrange.
		const settings = {
			show_on_front: 'page',
			page_on_front: 1,
		};
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( settings ) );

		// Act.
		const { component } = renderHookWithQuery( () => useHomepage() );

		// Assert.
		const expectedPath = '/elementor/v1/site-navigation/homepage';

		expect( apiFetch ).toHaveBeenCalledWith( {
			path: expectedPath,
		} );
		expect( apiFetch ).toHaveBeenCalledTimes( 1 );

		await waitFor( () => {
			return component.result.current.isSuccess;
		} );

		expect( component.result.current.data ).toBe( settings );
	} );
} );
