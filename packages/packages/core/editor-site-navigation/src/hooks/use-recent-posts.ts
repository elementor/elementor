import { useQuery } from '@elementor/query';

import { getRequest } from '../api/recent-posts';

export const recentPostsQueryKey = [ 'site-navigation', 'recent-posts' ];

export default function useRecentPosts() {
	return useQuery( {
		queryKey: recentPostsQueryKey,
		queryFn: () => getRequest(),
	} );
}
