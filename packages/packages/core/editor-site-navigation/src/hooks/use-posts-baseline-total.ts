import { useQuery } from '@elementor/query';

import { fetchPostsTotal, type Slug } from '../api/post';

export const postsBaselineTotalQueryKey = ( postTypeSlug: string ) => [ 'site-navigation', 'posts-baseline-total', postTypeSlug ];

export function usePostsBaselineTotal( postTypeSlug: Slug, enabled: boolean ) {
	return useQuery( {
		enabled,
		queryFn: () => fetchPostsTotal( postTypeSlug ),
		queryKey: postsBaselineTotalQueryKey( postTypeSlug ),
	} );
}