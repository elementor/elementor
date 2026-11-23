import { renderHookWithQuery } from 'test-utils';
import apiFetch from '@wordpress/api-fetch';

import { postsQueryKey } from '../use-posts';
import { postsBaselineTotalQueryKey } from '../use-posts-baseline-total';
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

	it( 'should run forceDeletePost from usePostActions hook', async () => {
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { forceDeletePost } = component.result.current;

		const queryKey = postsQueryKey( 'page' );
		const baselineQueryKey = postsBaselineTotalQueryKey( 'page' );

		await queryClient.setQueryData( queryKey, { posts: [] } );
		await queryClient.setQueryData( baselineQueryKey, 11 );

		await forceDeletePost.mutateAsync( 1 );

		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/pages/1?force=true',
			method: 'DELETE',
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
		expect( queryClient.getQueryState( baselineQueryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'should run restorePost from usePostActions hook', async () => {
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { restorePost } = component.result.current;

		const queryKey = postsQueryKey( 'page' );
		const baselineQueryKey = postsBaselineTotalQueryKey( 'page' );

		await queryClient.setQueryData( queryKey, { posts: [] } );
		await queryClient.setQueryData( baselineQueryKey, 11 );

		await restorePost.mutateAsync( 1 );

		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/pages/1',
			method: 'POST',
			data: {
				status: 'draft',
			},
		} );

		expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
		expect( queryClient.getQueryState( baselineQueryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'invalidates search queries when a post is updated', async () => {
		const { component, queryClient } = renderHookWithQuery( () => usePostActions( 'page' ) );
		const { updatePost } = component.result.current;

		const listQueryKey = postsQueryKey( 'page' );
		const searchQueryKey = postsQueryKey( 'page', 'about' );

		await queryClient.setQueryData( listQueryKey, { posts: [] } );
		await queryClient.setQueryData( searchQueryKey, { posts: [] } );

		await updatePost.mutateAsync( { id: 1, title: 'About us' } );

		expect( queryClient.getQueryState( listQueryKey )?.isInvalidated ).toBe( true );
		expect( queryClient.getQueryState( searchQueryKey )?.isInvalidated ).toBe( true );
	} );
} );
