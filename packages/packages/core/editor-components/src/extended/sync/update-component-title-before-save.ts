import { apiClient } from '../../api';
import { componentsActions } from '../../store/dispatchers';
import { componentsSelectors } from '../../store/selectors';
import { type DocumentSaveStatus } from '../../types';

export const updateComponentTitleBeforeSave = async ( status: DocumentSaveStatus ) => {
	const updatedComponentNames = componentsSelectors.getUpdatedComponentNames();

	if ( ! updatedComponentNames.length ) {
		return;
	}

	const result = await apiClient.updateComponentTitle( updatedComponentNames, status );

	if ( result.failedIds.length === 0 ) {
		componentsActions.cleanUpdatedComponentNames();
	}
};
