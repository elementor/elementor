import { dismissNotification, notify } from '@elementor/editor-notifications';
import { __ } from '@wordpress/i18n';

const EXPORT_STARTED_NOTIFICATION_ID = 'design-system-export-started';
const SUCCESS_NOTIFICATION_ID = 'design-system-export-succeeded';
const FAILURE_NOTIFICATION_ID = 'design-system-export-failed';

export const notifyExportInProgress = () => {
	notify( {
		id: EXPORT_STARTED_NOTIFICATION_ID,
		type: 'info',
		message: __( 'Export in progress. Your file will download when it’s ready.', 'elementor' ),
	} );
};

export const notifyExportSuccess = () => {
	dismissNotification( EXPORT_STARTED_NOTIFICATION_ID );

	notify( {
		id: SUCCESS_NOTIFICATION_ID,
		type: 'success',
		message: __( 'Design system exported', 'elementor' ),
	} );
};

export const notifyExportFailure = ( onRetry: () => void ) => {
	dismissNotification( EXPORT_STARTED_NOTIFICATION_ID );

	notify( {
		id: FAILURE_NOTIFICATION_ID,
		type: 'error',
		message: __( 'Your design system export failed', 'elementor' ),
		additionalActionProps: [
			{
				size: 'small',
				variant: 'outlined',
				color: 'error',
				children: __( 'Try again', 'elementor' ),
				onClick: () => {
					dismissNotification( FAILURE_NOTIFICATION_ID );
					onRetry();
				},
			},
		],
	} );
};
