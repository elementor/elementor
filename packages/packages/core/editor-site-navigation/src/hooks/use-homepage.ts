import { useQuery } from '@elementor/query';

import { getSettings } from '../api/settings';

export const settingsQueryKey = () => [ 'site-navigation', 'homepage' ];

export function useHomepage() {
	return useQuery( {
		queryKey: settingsQueryKey(),
		queryFn: () => getSettings(),
	} );
}
