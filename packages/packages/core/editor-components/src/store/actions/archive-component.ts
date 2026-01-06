import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { __getStore as getStore } from '@elementor/store';

import { slice } from '../store';
import { NotificationData, notify } from '@elementor/editor-notifications';

const successNotification = ( componentName: string ): NotificationData => ( {
	type: 'success',
	message: `Successfully deleted component ${ componentName }`,
	id: 'success-archived-components-notification',
} );

export const archiveComponent = ( componentId: number, componentName: string ) => {
	const store = getStore();
	const dispatch = store?.dispatch;

	if ( ! dispatch ) {
		return;
	}

	dispatch( slice.actions.archive( componentId ) );
	setDocumentModifiedStatus( true );
	notify( successNotification( componentName ) );	
};
