import { useQuery, type UseQueryResult } from '@elementor/query';

import { fetchCssClassUsage } from '../service/css-class-usage-service';
import { type EnhancedCssClassUsage, QUERY_KEY } from '../types';

export const useCssClassUsage = (): UseQueryResult< EnhancedCssClassUsage > => {
	return useQuery( {
		queryKey: [ QUERY_KEY ],
		queryFn: fetchCssClassUsage,
		refetchOnMount: false,
		refetchOnWindowFocus: true,
	} );
};
