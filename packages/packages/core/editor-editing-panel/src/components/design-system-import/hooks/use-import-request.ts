import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { dismissNotification, notify } from '@elementor/editor-notifications';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

import { importDialogState, type ImportResult } from '../state';
import { type ConflictStrategy } from '../types';

const PLACEHOLDER_ENDPOINT = '/design-system/import';
const GLOBAL_STYLES_IMPORTED_EVENT = 'elementor/global-styles/imported';
const IMPORT_STARTED_NOTIFICATION_ID = 'design-system-import-started';
const SUCCESS_NOTIFICATION_ID = 'design-system-import-succeeded';
const FAILURE_NOTIFICATION_ID = 'design-system-import-failed';

// TEMP: artificial delay so the in-progress state is visible during manual QA. Remove before merging.
const QA_DELAY_MS = 3000;

type ImportRequestArgs = {
	file: File;
	conflictStrategy: ConflictStrategy;
};

const wait = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

const reloadCurrentDocument = () => {
	const current = getCurrentDocument();

	if ( ! current?.id ) {
		return Promise.resolve();
	}

	getV1DocumentsManager().invalidateCache();

	return runCommand( 'editor/documents/switch', {
		id: current.id,
		shouldScroll: false,
		shouldNavigateToDefaultRoute: false,
	} );
};

const broadcastGlobalStylesImported = ( detail: unknown ) => {
	window.dispatchEvent( new CustomEvent( GLOBAL_STYLES_IMPORTED_EVENT, { detail } ) );
};

const handleRetryClick = () => {
	dismissNotification( FAILURE_NOTIFICATION_ID );

	if ( importDialogState.getSnapshot().isImporting ) {
		return;
	}

	importDialogState.open();
};

const handleViewClick = () => {
	dismissNotification( SUCCESS_NOTIFICATION_ID );
	importDialogState.openResults();
};

const notifySuccess = () => {
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
				onClick: handleViewClick,
			},
		],
	} );
};

const notifyFailure = () => {
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
				onClick: handleRetryClick,
			},
		],
	} );
};

export const useImportRequest = () => {
	return async ( { file, conflictStrategy }: ImportRequestArgs ) => {
		const formData = new FormData();
		formData.append( 'file', file );
		formData.append( 'conflict_strategy', conflictStrategy );

		try {
			await wait( QA_DELAY_MS );

			const response = await httpService().post( PLACEHOLDER_ENDPOINT, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			} );

			// Backend contract is not finalised yet — listeners fall back to a full server fetch
			// when detail is undefined or missing fields, so passing response.data is safe either way.
			broadcastGlobalStylesImported( response?.data );

			await reloadCurrentDocument();

			const result: ImportResult = {
				successfulCount: response?.data?.successful_count ?? 0,
				unsuccessfulCount: response?.data?.unsuccessful_count ?? 0,
			};
			importDialogState.setResult( result );

			notifySuccess();
		} catch {
			importDialogState.setResult( null );
			notifyFailure();
		} finally {
			importDialogState.markIdle();
		}
	};
};
