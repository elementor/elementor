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
import { postsQueryKey } from './use-posts';
import { recentPostsQueryKey } from './use-recent-posts';

export function usePostActions( postTypeSlug: Slug ) {
	const invalidatePosts = useInvalidatePosts( postTypeSlug );

	const onSuccess = () => invalidatePosts( { exact: true } );

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

	const duplicatePost = useMutation( {
		mutationFn: ( originalPost: UpdatePost ) => duplicateRequest( originalPost ),
		onSuccess,
	} );

	return {
		createPost,
		updatePost,
		deletePost,
		duplicatePost,
	};
}

function useInvalidatePosts( postTypeSlug: string ) {
	const queryClient = useQueryClient();

	return ( options = {} ) => {
		const queryKey = postsQueryKey( postTypeSlug );
		queryClient.invalidateQueries( { queryKey: recentPostsQueryKey }, options );
		return queryClient.invalidateQueries( { queryKey }, options );
	};
}
