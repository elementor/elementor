import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __getState as getState } from '@elementor/store';

import { apiClient } from '../../api';
import { selectArchivedThisSession } from '../../store/store';
import { type DocumentSaveStatus } from '../../types';

const failedNotification = ( message: string ): NotificationData => ( {
	type: 'error',
	message: `Failed to archive components: ${ message }`,
	id: 'failed-archived-components-notification',
} );

export const updateArchivedComponentBeforeSave = async ( status: DocumentSaveStatus ) => {
	try {
		const archivedComponents = selectArchivedThisSession( getState() );

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
