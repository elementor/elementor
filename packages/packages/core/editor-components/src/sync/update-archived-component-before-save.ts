import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectArchivedComponents } from '../store/store';

const failedNotification = ( message: string ): NotificationData => ( {
	type: 'error',
	message: `Failed to archive components: ${ message }`,
	id: 'failed-archived-components-notification',
} );

const successNotification = ( message: string ): NotificationData => ( {
	type: 'success',
	message: `Successfully archived components: ${ message }`,
	id: 'success-archived-components-notification',
} );

export const updateArchivedComponentBeforeSave = async () => {
	try {
		const archivedComponents = selectArchivedComponents( getState() );

		if ( ! archivedComponents.length ) {
			return;
		}

		const result = await apiClient.updateArchivedComponents(
			archivedComponents.map( ( component ) => component.id )
		);
		if ( result.failedArchivedIds.length > 0 ) {
			notify( failedNotification( result.failedArchivedIds.join( ', ' ) ) );
		}

		if ( result.successArchivedIds.length > 0 ) {
			notify( successNotification( result.successArchivedIds.join( ', ' ) ) );
		}
	} catch ( error ) {
		throw new Error( `Failed to update archived components: ${ error }` );
	}
};
