import { type NotificationData, notify } from '@elementor/editor-notifications';

type OperationResult = {
	successIds: number[];
	failed: Array< { id: number; error: string } >;
};

export function handleArchivedComponents( result: OperationResult ): void {
	if ( result.failed.length > 0 ) {
		const failedIds = result.failed.map( ( item ) => item.id );
		const failedNotification: NotificationData = {
			type: 'error',
			message: `Failed to archive components: ${ failedIds.join( ', ' ) }`,
			id: 'failed-archived-components-notification',
		};
		notify( failedNotification );
	}
}
