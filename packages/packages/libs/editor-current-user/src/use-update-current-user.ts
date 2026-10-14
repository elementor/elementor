import { useMutation, useQueryClient } from '@elementor/query';

import { apiClient } from './api';
import { EDITOR_CURRENT_USER_QUERY_KEY } from './use-current-user';

export const useUpdateCurrentUser = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: apiClient.update,
		onSuccess: () => queryClient.invalidateQueries( { queryKey: [ EDITOR_CURRENT_USER_QUERY_KEY ] } ),
	} );
};
