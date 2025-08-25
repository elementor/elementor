import { useQuery } from '@elementor/query';

import { apiClient } from '../api';

const COMPONENTS_QUERY_KEY = 'components';

export const useComponents = () => {
	return useQuery( {
		queryKey: [ COMPONENTS_QUERY_KEY ],
		queryFn: apiClient.get,
		staleTime: Infinity,
	} );
};
