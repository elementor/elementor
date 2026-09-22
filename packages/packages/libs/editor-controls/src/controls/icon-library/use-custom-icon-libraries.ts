import { useQuery } from '@elementor/query';

import { loadCustomIconLibraries } from './custom-icon-libraries';
import { type FontAwesome7Icon } from './font-awesome-7-catalog';

const CUSTOM_ICON_LIBRARIES_QUERY_KEY = ['custom-icon-libraries'];

export function useCustomIconLibraries(enabled: boolean) {
	return useQuery<FontAwesome7Icon[]>({
		queryKey: CUSTOM_ICON_LIBRARIES_QUERY_KEY,
		queryFn: ({ signal }) => loadCustomIconLibraries(signal),
		enabled,
		staleTime: Infinity,
	});
}
