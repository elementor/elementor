import { type NotificationData, notify } from '@elementor/editor-notifications';

import { type OperationResult } from '../api';
import { invalidateComponentDocumentData } from '../utils/component-document-data';

export function handlePublishedComponents( result: OperationResult ): void {
	result.successIds.forEach( ( id ) => invalidateComponentDocumentData( id ) );

	if ( result.failed.length > 0 ) {
		const failedIds = result.failed.map( ( item ) => item.id );
		const failedNotification: NotificationData = {
			type: 'error',
			message: `Failed to publish components: ${ failedIds.join( ', ' ) }`,
			id: 'failed-published-components-notification',
		};
		notify( failedNotification );
	}
}
