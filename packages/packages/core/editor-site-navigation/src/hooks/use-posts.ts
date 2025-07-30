import { useInfiniteQuery } from '@elementor/query';

import { getRequest, type PostsResponse, type Slug } from '../api/post';
import { type Post } from '../types';

export const postsQueryKey = ( postTypeSlug: string ) => [ 'site-navigation', 'posts', postTypeSlug ];

const flattenData = ( data?: { pages: PostsResponse[] } ) => {
	if ( ! data ) {
		return data;
	}

	const flattened: Post[] = [];

	data.pages.forEach( ( page ) => {
		flattened.push( ...page.data );
	} );

	return flattened;
};

export function usePosts( postTypeSlug: Slug ) {
	const query = useInfiniteQuery( {
		queryKey: postsQueryKey( postTypeSlug ),
		queryFn: ( { pageParam = 1 } ) => getRequest( postTypeSlug, pageParam ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage ) => {
			return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
		},
	} );

	return { ...query, data: { posts: flattenData( query.data ), total: query.data?.pages[ 0 ]?.totalPosts ?? 0 } };
}
