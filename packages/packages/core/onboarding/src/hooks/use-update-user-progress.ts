import { useMutation, useQueryClient } from '@elementor/query';

import { progressApi, type UpdateProgressPayload } from '../api/progress';
import { USER_PROGRESS_QUERY_KEY } from './use-user-progress';

export function useUpdateUserProgress() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( payload: UpdateProgressPayload ) => progressApi.update( payload ),
		onSuccess: () => queryClient.invalidateQueries( { queryKey: [ USER_PROGRESS_QUERY_KEY ] } ),
	} );
}
