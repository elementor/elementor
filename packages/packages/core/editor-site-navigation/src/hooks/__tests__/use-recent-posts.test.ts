import { renderHookWithQuery } from 'test-utils';
import { waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';

import { baseUrl } from '../../api/recent-posts';
import useRecentPosts from '../use-recent-posts';

// Mock apiFetch to return a promise that resolves to an empty array.
jest.mock( '@wordpress/api-fetch' );

describe( 'useRecentPosts', () => {
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

		// Act.
		const { component } = renderHookWithQuery( () => useRecentPosts() );

		expect( apiFetch ).toHaveBeenCalledWith( {
			path: `${ baseUrl }?posts_per_page=6`,
		} );

		await waitFor( () => {
			expect( component.result.current.data ).toBe( posts );
		} );
	} );
} );
