import { apiClient } from '../../api';
import { componentsStore } from '../../store/dispatchers';
import { type DocumentSaveStatus } from '../../types';

export const updateComponentTitleBeforeSave = async ( status: DocumentSaveStatus ) => {
	const updatedComponentNames = componentsStore.getUpdatedComponentNames();

	if ( ! updatedComponentNames.length ) {
		return;
	}

	const result = await apiClient.updateComponentTitle( updatedComponentNames, status );

	if ( result.failedIds.length === 0 ) {
		componentsStore.cleanUpdatedComponentNames();
	}
};
