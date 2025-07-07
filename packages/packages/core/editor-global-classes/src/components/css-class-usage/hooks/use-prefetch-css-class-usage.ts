import { useQueryClient } from '@elementor/query';

import { fetchCssClassUsage } from '../service/css-class-usage-service';
import { QUERY_KEY } from '../types';

export function usePrefetchCssClassUsage() {
	const queryClient = useQueryClient();

	const runFetch = () =>
		queryClient.prefetchQuery( {
			queryKey: [ QUERY_KEY ],
			queryFn: fetchCssClassUsage,
		} );

	return { runFetch };
}
