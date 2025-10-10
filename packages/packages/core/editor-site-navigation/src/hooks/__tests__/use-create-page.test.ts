import { renderHook } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import useCreatePage, { endpointPath } from '../use-create-page';

// Mock apiFetch to return a promise that resolves to an empty array.
jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/recently-edited/use-page', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( [] ) );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should run useCreatePage hook', async () => {
		// Arrange.
		const { result } = renderHook( useCreatePage );
		const newPost = {
			id: 1,
			edit_url: 'edit-url.com',
		};
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( newPost ) );

		const { create } = result.current;

		// Act.
		create();

		// Assert.
		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			data: { post_type: 'page' },
			method: 'POST',
			path: endpointPath,
		} );
	} );
} );
