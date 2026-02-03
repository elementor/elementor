import { useQuery } from '@elementor/query';

import { choicesApi } from '../api/choices';

export const USER_CHOICES_QUERY_KEY = 'onboarding-user-choices';

export function useUserChoices() {
	return useQuery( {
		queryKey: [ USER_CHOICES_QUERY_KEY ],
		queryFn: choicesApi.get,
	} );
}
