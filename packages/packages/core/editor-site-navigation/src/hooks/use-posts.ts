import { keepPreviousData, useInfiniteQuery } from '@elementor/query';

import { getRequest, POST_PER_PAGE, type PostsResponse, type Slug } from '../api/post';
import { DEFAULT_SITE_CONTENT_SORT, type SiteContentSortOption } from '../site-content-sort';
import {
	EMPTY_SITE_CONTENT_STATUS_FILTERS,
	getRestStatusForSiteContentFilters,
	type SiteContentStatusFilters,
} from '../site-content-status-filter';
import { type Post } from '../types';

export const postsQueryKeyBase = ( postTypeSlug: string ) => [ 'site-navigation', 'posts', postTypeSlug ];

export const postsQueryKey = (
	postTypeSlug: string,
	trimmedSearch = '',
	restStatus = 'any',
	sort: SiteContentSortOption = DEFAULT_SITE_CONTENT_SORT
) => [ ...postsQueryKeyBase( postTypeSlug ), restStatus, trimmedSearch, sort ];

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
	statusFilters: SiteContentStatusFilters = EMPTY_SITE_CONTENT_STATUS_FILTERS,
	sort: SiteContentSortOption = DEFAULT_SITE_CONTENT_SORT
) {
	const trimmedSearch = search.trim();
	const restStatus = getRestStatusForSiteContentFilters( statusFilters );

	const query = useInfiniteQuery( {
		queryKey: postsQueryKey( postTypeSlug, trimmedSearch, restStatus, sort ),
		queryFn: ( { pageParam = 1 } ) =>
			getRequest( postTypeSlug, pageParam as number, trimmedSearch, restStatus, POST_PER_PAGE, sort ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage: PostsResponse ) => {
			return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
		},
		placeholderData: keepPreviousData,
	} );

	return { ...query, data: { posts: flattenData( query.data ), total: query.data?.pages[ 0 ]?.totalPosts ?? 0 } };
}
