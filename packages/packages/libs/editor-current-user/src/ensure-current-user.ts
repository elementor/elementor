import { getQueryClient } from '@elementor/query';

import { getCurrentUser } from './get-current-user';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export async function ensureUser() {
	const queryClient = getQueryClient();

	return queryClient.ensureQueryData( {
		queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
		queryFn: getCurrentUser,
		retry: false,
	} );
}
