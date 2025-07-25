import { useQuery } from '@elementor/query';

import { getCurrentUser } from './get-current-user';

export const EDITOR_CURRENT_USER_QUERY_KEY = 'editor-current-user';

export const useCurrentUser = () =>
	useQuery( {
		queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ],
		queryFn: getCurrentUser,
	} );
