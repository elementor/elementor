import { keepPreviousData, useInfiniteQuery } from '@elementor/query';

import { getRequest, type PostsResponse, type Slug } from '../api/post';
import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	getRestStatusForSiteContentFilters,
	type SiteContentStatusFilters,
} from '../site-content-status-filter';
import { type Post } from '../types';

export const postsQueryKeyBase = ( postTypeSlug: string ) => [ 'site-navigation', 'posts', postTypeSlug ];

export const postsQueryKey = (
	postTypeSlug: string,
	search = '',
	statusFilters: SiteContentStatusFilters = EMPTY_SITE_CONTENT_STATUS_FILTERS
) => {
	const trimmedSearch = search.trim();
	const restStatus = getRestStatusForSiteContentFilters( statusFilters );

	return [ ...postsQueryKeyBase( postTypeSlug ), restStatus, trimmedSearch ];
};

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

export function usePosts(
	postTypeSlug: Slug,
	search = '',
	statusFilters: SiteContentStatusFilters = EMPTY_SITE_CONTENT_STATUS_FILTERS
) {
	const trimmedSearch = search.trim();
	const restStatus = getRestStatusForSiteContentFilters( statusFilters );

	const query = useInfiniteQuery( {
		getNextPageParam: ( lastPage ) => {
			return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
		},
		initialPageParam: 1,
		placeholderData: keepPreviousData,
		queryFn: ( { pageParam = 1 } ) => getRequest( postTypeSlug, pageParam, trimmedSearch, restStatus ),
		queryKey: [ ...postsQueryKeyBase( postTypeSlug ), restStatus, trimmedSearch ],
	} );

	return { ...query, data: { posts: flattenData( query.data ), total: query.data?.pages[ 0 ]?.totalPosts ?? 0 } };
}