import { useMutation, useQueryClient } from '@elementor/query';

import { type UpdateReadingSettings, updateSettings } from '../api/settings';
import { settingsQueryKey } from './use-homepage';

export function useHomepageActions() {
	const queryClient = useQueryClient();
	const invalidateSettings = useInvalidateSettings();

	const onSuccess = async ( _data: unknown, settings: UpdateReadingSettings ) => {
		const homepageQueryKey = settingsQueryKey();

		if ( 'page' === settings.show_on_front ) {
			queryClient.setQueryData( homepageQueryKey, settings.page_on_front );
		} else {
			queryClient.setQueryData( homepageQueryKey, 0 );
		}

		await invalidateSettings( { exact: true } );
	};

	const updateSettingsMutation = useMutation( {
		mutationFn: ( settings: UpdateReadingSettings ) => updateSettings( settings ),
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
