import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
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
		const onCreated = jest.fn();
		const { result } = renderHook( () => useCreatePage( { onCreated } ) );
		const newPost = {
			id: 1,
			edit_url: 'editurl.com',
		};
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( newPost ) );

		const { create } = result.current;

		// Act.
		create();

		// Assert.
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith( {
				data: { post_type: 'page' },
				method: 'POST',
				path: endpointPath,
			} );
			expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
