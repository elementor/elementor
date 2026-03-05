import { getQueryClient } from '@elementor/query';

import { type UserModel } from './api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export const getCurrentUser = () => {
	const queryClient = getQueryClient();

	return queryClient.getQueryData< UserModel >( [ EDITOR_CURRENT_USER_QUERY_KEY ] );
};
