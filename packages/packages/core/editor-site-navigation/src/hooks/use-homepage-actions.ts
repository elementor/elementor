import { useMutation, useQueryClient } from '@elementor/query';

import { type Settings, updateSettings } from '../api/settings';
import { settingsQueryKey } from './use-homepage';

export function useHomepageActions() {
	const invalidateSettings = useInvalidateSettings();

	const onSuccess = async () => invalidateSettings( { exact: true } );

	const updateSettingsMutation = useMutation( {
		mutationFn: ( settings: Settings ) => updateSettings( settings ),
		onSuccess,
	} );

	return { updateSettingsMutation };
}

function useInvalidateSettings() {
	const queryClient = useQueryClient();

	return ( options = {} ) => {
		const queryKey = settingsQueryKey();

		return queryClient.invalidateQueries( { queryKey }, options );
	};
}
