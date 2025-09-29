import { useQuery } from '@elementor/query';

import { apiClient } from '../api';

export const COMPONENTS_QUERY_KEY = 'components';

export const useComponents = () => {
	return useQuery( {
		queryKey: [ COMPONENTS_QUERY_KEY ],
		queryFn: apiClient.get,
		staleTime: Infinity,
	} );
};
