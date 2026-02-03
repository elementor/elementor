import { useQuery } from '@elementor/query';

import { progressApi } from '../api/progress';

export const USER_PROGRESS_QUERY_KEY = 'onboarding-user-progress';

export function useUserProgress() {
	return useQuery( {
		queryKey: [ USER_PROGRESS_QUERY_KEY ],
		queryFn: progressApi.get,
	} );
}
