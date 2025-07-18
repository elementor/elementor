import { useQueryClient } from '@elementor/query';

import { fetchCssClassUsage } from '../../service/css-class-usage-service';
import { QUERY_KEY } from '../components/css-class-usage/types';

export function usePrefetchCssClassUsage() {
	const queryClient = useQueryClient();

	const prefetchClassesUsage = () =>
		queryClient.prefetchQuery( {
			queryKey: [ QUERY_KEY ],
			queryFn: fetchCssClassUsage,
		} );

	return { prefetchClassesUsage };
}
