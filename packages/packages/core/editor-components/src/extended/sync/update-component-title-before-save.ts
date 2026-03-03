import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectUpdatedComponentNames, slice } from '../../store/store';
import { type DocumentSaveStatus } from '../../types';

export const updateComponentTitleBeforeSave = async ( status: DocumentSaveStatus ) => {
	const updatedComponentNames = selectUpdatedComponentNames( getState() );

	if ( ! updatedComponentNames.length ) {
		return;
	}

	const result = await apiClient.updateComponentTitle( updatedComponentNames, status );

	if ( result.failedIds.length === 0 ) {
		dispatch( slice.actions.cleanUpdatedComponentNames() );
	}
};
