import { useQuery } from '@elementor/query';

import { apiClient } from '../api';
import { COMPONENTS_QUERY_KEY } from '../consts';

export const useComponents = () => {
	return useQuery( {
		queryKey: [ COMPONENTS_QUERY_KEY ],
		queryFn: apiClient.get,
		staleTime: Infinity,
	} );
};
