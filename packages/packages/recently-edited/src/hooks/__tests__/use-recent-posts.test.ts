import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import apiFetch from '@wordpress/api-fetch';
import useRecentPosts, { endpointPath } from '../use-recent-posts';

// Mock apiFetch to return a promise that resolves to an empty array.
jest.mock( '@wordpress/api-fetch' );

describe( 'useRecentPosts', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( [] ) );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return an array of posts when the request succeeds', async () => {
		const posts = [
			{
				id: 1,
				title: 'Post 1',
			},
			{
				id: 2,
				title: 'Post 2',
			},
		];

		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( posts ) );

		const { result } = renderHook( () => useRecentPosts( 1 ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith( {
				path: endpointPath + '?posts_per_page=5&post__not_in=1',
			} );

			expect( result.current.recentPosts ).toBe( posts );
		} );
	} );
} );
