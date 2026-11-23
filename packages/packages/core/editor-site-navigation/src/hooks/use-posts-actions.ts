import { useMutation, useQueryClient } from '@elementor/query';

import {
	createRequest,
	deleteRequest,
	duplicateRequest,
	type NewPost,
	type Slug,
	type UpdatePost,
	updateRequest,
} from '../api/post';
import { SITE_CONTENT_V1_RESTORE_STATUS } from '../site-content-restore';
import { postsQueryKeyBase } from './use-posts';
import { postsBaselineTotalQueryKey } from './use-posts-baseline-total';
import { recentPostsQueryKey } from './use-recent-posts';

export function usePostActions( postTypeSlug: Slug ) {
	const invalidatePosts = useInvalidatePosts( postTypeSlug );

	const onSuccess = () => invalidatePosts();

	const createPost = useMutation( {
		mutationFn: ( newPost: NewPost ) => createRequest( postTypeSlug, newPost ),
		onSuccess,
	} );

	const updatePost = useMutation( {
		mutationFn: ( updatedPost: UpdatePost ) => updateRequest( postTypeSlug, updatedPost ),
		onSuccess,
	} );

	const deletePost = useMutation( {
		mutationFn: ( postId: number ) => deleteRequest( postTypeSlug, postId ),
		onSuccess,
	} );

	const forceDeletePost = useMutation( {
		mutationFn: ( postId: number ) => deleteRequest( postTypeSlug, postId, true ),
		onSuccess,
	} );

	const restorePost = useMutation( {
		mutationFn: ( postId: number ) =>
			updateRequest( postTypeSlug, { id: postId, status: SITE_CONTENT_V1_RESTORE_STATUS } ),
		onSuccess,
	} );

	const duplicatePost = useMutation( {
		mutationFn: ( originalPost: UpdatePost ) => duplicateRequest( originalPost ),
		onSuccess,
	} );

	return {
		createPost,
		deletePost,
		duplicatePost,
		forceDeletePost,
		restorePost,
		updatePost,
	};
}

function useInvalidatePosts( postTypeSlug: string ) {
	const queryClient = useQueryClient();

	return () => {
		const queryKey = postsQueryKeyBase( postTypeSlug );
		queryClient.invalidateQueries( { queryKey: recentPostsQueryKey } );
		queryClient.invalidateQueries( { queryKey: postsBaselineTotalQueryKey( postTypeSlug ) } );

		return queryClient.invalidateQueries( { queryKey } );
	};
}
