import { getQueryClient } from '@elementor/query';

import { apiClient } from './api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export async function ensureUser() {
	const queryClient = getQueryClient();

	return queryClient.ensureQueryData( {
		queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
		queryFn: apiClient.get,
		retry: false,
	} );
}
