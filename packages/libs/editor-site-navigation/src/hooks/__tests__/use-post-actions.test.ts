import { renderHookWithQuery } from 'test-utils';
import apiFetch from '@wordpress/api-fetch';

import { postsQueryKey } from '../use-posts';
import { usePostActions } from '../use-posts-actions';

jest.mock( '@wordpress/api-fetch' );

describe( '@elementor/site-settings/use-post-actions', () => {
	beforeEach( () => {
		jest.mocked( apiFetch ).mockImplementation( () => Promise.resolve( {} ) );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should run createPost from usePostActions hook', async () => {
		// Arrange.
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { createPost } = component.result.current;

		const queryKey = postsQueryKey( 'page' );
		await queryClient.setQueryData( queryKey, {
			posts: [],
		} );

		// Act.
		await createPost.mutateAsync( { title: 'Page', status: 'publish' } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/pages',
			method: 'POST',
			data: {
				title: 'Page',
				status: 'publish',
			},
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'should run updatePost from usePostActions hook', async () => {
		// Arrange.
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { updatePost } = component.result.current;

		const queryKey = postsQueryKey( 'page' );
		await queryClient.setQueryData( queryKey, {
			posts: [],
		} );

		// Act.
		await updatePost.mutateAsync( { id: 1, title: 'Page' } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/pages/1',
			method: 'POST',
			data: {
				title: 'Page',
			},
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'should run deletePost from usePostActions hook', async () => {
		// Arrange.
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { deletePost } = component.result.current;

		const queryKey = postsQueryKey( 'page' );
		await queryClient.setQueryData( queryKey, {
			posts: [],
		} );

		// Act.
		await deletePost.mutateAsync( 1 );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/pages/1',
			method: 'DELETE',
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
	} );
} );
