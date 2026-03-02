import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __ } from '@wordpress/i18n';

import { componentsStore } from '../../../store/dispatchers';

const successNotification = ( componentId: number, componentName: string ): NotificationData => ( {
	type: 'success',
	/* translators: %s: component name */
	message: __( 'Successfully deleted component %s', 'elementor' ).replace( '%s', componentName ),
	id: `success-archived-components-notification-${ componentId }`,
} );

export const archiveComponent = ( componentId: number, componentName: string ) => {
	componentsStore.archive( componentId );
	setDocumentModifiedStatus( true );
	notify( successNotification( componentId, componentName ) );
};
