import { useQueryClient } from '@elementor/query';

import { apiClient } from '../api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from '../use-current-user';

export function PrefetchUserData() {
	const queryClient = useQueryClient();

	queryClient.prefetchQuery( {
		queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
		queryFn: apiClient.get,
	} );

	return null;
}
