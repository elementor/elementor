import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectUpdatedComponentNames, slice } from '../store/store';

export const updateComponentTitleBeforeSave = async () => {
	const updatedComponentNames = selectUpdatedComponentNames( getState() );

	if ( ! updatedComponentNames.length ) {
		return;
	}

	const result = await apiClient.updateComponentTitle( updatedComponentNames );

	if ( result.failedIds.length === 0 ) {
		dispatch( slice.actions.cleanUpdatedComponentNames() );
	}
};
