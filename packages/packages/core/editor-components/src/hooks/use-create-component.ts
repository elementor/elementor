import { useMutation, useQueryClient } from '@elementor/query';

import { apiClient } from '../api';

const COMPONENTS_QUERY_KEY = 'components';

export const useCreateComponentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: apiClient.create,
		onSuccess: () => queryClient.invalidateQueries( { queryKey: [ COMPONENTS_QUERY_KEY ] } ),
	} );
};
