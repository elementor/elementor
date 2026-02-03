import { useMutation, useQueryClient } from '@elementor/query';

import { choicesApi, type UpdateChoicesPayload } from '../api/choices';
import { USER_CHOICES_QUERY_KEY } from './use-user-choices';

export function useUpdateUserChoices() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( payload: UpdateChoicesPayload ) => choicesApi.update( payload ),
		onSuccess: () => queryClient.invalidateQueries( { queryKey: [ USER_CHOICES_QUERY_KEY ] } ),
	} );
}
