import * as React from 'react';
import { dismissNotification, notify } from '@elementor/editor-notifications';
import { closeDialog, openDialog } from '@elementor/editor-ui';
import { getQueryClient } from '@elementor/query';
import { __ } from '@wordpress/i18n';

import { IMPORT_DESIGN_SYSTEM_MUTATION_KEY } from './hooks/use-import-request';
import { ImportResultsDialog } from './import-results-dialog';
import { type ImportResult } from './types';

const IMPORT_STARTED_NOTIFICATION_ID = 'design-system-import-started';
const SUCCESS_NOTIFICATION_ID = 'design-system-import-succeeded';
const FAILURE_NOTIFICATION_ID = 'design-system-import-failed';

export const notifyImportInProgress = () => {
	notify( {
		id: IMPORT_STARTED_NOTIFICATION_ID,
		type: 'info',
		message: __( 'Import in Progress. You will be notified when the import is complete.', 'elementor' ),
	} );
};

export const notifyImportSuccess = ( result: ImportResult ) => {
	dismissNotification( IMPORT_STARTED_NOTIFICATION_ID );

	notify( {
		id: SUCCESS_NOTIFICATION_ID,
		type: 'success',
		message: __( 'Design system imported', 'elementor' ),
		additionalActionProps: [
			{
				size: 'small',
				variant: 'outlined',
				color: 'success',
				children: __( 'View', 'elementor' ),
				onClick: () => {
					dismissNotification( SUCCESS_NOTIFICATION_ID );
					openDialog( {
						component: <ImportResultsDialog result={ result } onClose={ closeDialog } />,
					} );
				},
			},
		],
	} );
};

export const notifyImportFailure = ( onRetry: () => void ) => {
	dismissNotification( IMPORT_STARTED_NOTIFICATION_ID );

	notify( {
		id: FAILURE_NOTIFICATION_ID,
		type: 'error',
		message: __( 'Your design system import failed', 'elementor' ),
		additionalActionProps: [
			{
				size: 'small',
				variant: 'outlined',
				color: 'error',
				children: __( 'Try again', 'elementor' ),
				onClick: () => {
					dismissNotification( FAILURE_NOTIFICATION_ID );

					const isImporting =
						getQueryClient().isMutating( { mutationKey: [ ...IMPORT_DESIGN_SYSTEM_MUTATION_KEY ] } ) > 0;

					if ( isImporting ) {
						return;
					}

					onRetry();
				},
			},
		],
	} );
};
