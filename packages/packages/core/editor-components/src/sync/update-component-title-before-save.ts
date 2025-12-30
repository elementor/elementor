import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectUpdatedComponentNames, slice } from '../store/store';

const failedNotification = ( message: string ): NotificationData => ( {
	type: 'error',
	message: `Failed to update component title: ${ message }`,
	id: 'failed-update-component-title-notification',
} );

const successNotification = ( message: string ): NotificationData => ( {
	type: 'success',
	message: `Successfully updated component title: ${ message }`,
	id: 'success-update-component-title-notification',
} );

export const updateComponentTitleBeforeSave = async () => {
	const updatedComponentNames = selectUpdatedComponentNames( getState() );

	if ( ! updatedComponentNames.length ) {
		return;
	}

	const result = await apiClient.updateComponentTitle( updatedComponentNames );

	dispatch( slice.actions.cleanUpdatedComponentNames() );

	if ( result.failedIds.length ) {
		notify( failedNotification( result.failedIds.join( ', ' ) ) );
	}
	if ( result.successIds.length ) {
		notify( successNotification( result.successIds.join( ', ' ) ) );
	}
};
