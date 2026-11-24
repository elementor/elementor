import { useQuery } from '@elementor/query';

import { fetchPostsTotal, type Slug } from '../api/post';

export const postsBaselineTotalQueryKeyBase = ( postTypeSlug: string ) => [
	'site-navigation',
	'posts-baseline-total',
	postTypeSlug,
];

export const postsBaselineTotalQueryKey = ( postTypeSlug: string, status = 'any' ) => [
	...postsBaselineTotalQueryKeyBase( postTypeSlug ),
	status,
];

export function usePostsBaselineTotal( postTypeSlug: Slug, enabled: boolean, status = 'any' ) {
	return useQuery( {
		enabled,
		queryFn: () => fetchPostsTotal( postTypeSlug, status ),
		queryKey: postsBaselineTotalQueryKey( postTypeSlug, status ),
	} );
}
