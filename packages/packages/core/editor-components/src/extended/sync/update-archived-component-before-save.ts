import { type NotificationData, notify } from '@elementor/editor-notifications';

import { apiClient } from '../../api';
import { componentsStore } from '../../store/dispatchers';
import { type DocumentSaveStatus } from '../../types';

const failedNotification = ( message: string ): NotificationData => ( {
	type: 'error',
	message: `Failed to archive components: ${ message }`,
	id: 'failed-archived-components-notification',
} );

export const updateArchivedComponentBeforeSave = async ( status: DocumentSaveStatus ) => {
	try {
		const archivedComponents = componentsStore.getArchivedThisSession();

		if ( ! archivedComponents.length ) {
			return;
		}

		const result = await apiClient.updateArchivedComponents( archivedComponents, status );

		const failedIds = result.failedIds.join( ', ' );

		if ( failedIds ) {
			notify( failedNotification( failedIds ) );
		}
	} catch ( error ) {
		throw new Error( `Failed to update archived components: ${ error }` );
	}
};
