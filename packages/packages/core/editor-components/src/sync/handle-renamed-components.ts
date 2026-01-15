import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __dispatch as dispatch } from '@elementor/store';

import { type OperationResult } from '../api';
import { slice } from '../store/store';

export function handleRenamedComponents( result: OperationResult ): void {
	if ( result.successIds.length > 0 ) {
		dispatch( slice.actions.cleanUpdatedComponentNamesByIds( result.successIds ) );
	}

	if ( result.failed.length > 0 ) {
		const failedIds = result.failed.map( ( item ) => item.id );
		const failedNotification: NotificationData = {
			type: 'error',
			message: `Failed to rename components: ${ failedIds.join( ', ' ) }`,
			id: 'failed-renamed-components-notification',
		};
		notify( failedNotification );
	}
}
