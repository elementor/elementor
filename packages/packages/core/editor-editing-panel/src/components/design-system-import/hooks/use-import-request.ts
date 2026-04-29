import { getCurrentDocument, getV1DocumentsManager } from '@elementor/editor-documents';
import { notify } from '@elementor/editor-notifications';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

import { importDialogState } from '../state';
import { type ConflictStrategy } from '../types';

const PLACEHOLDER_ENDPOINT = '/design-system/import';
const GLOBAL_STYLES_IMPORTED_EVENT = 'elementor/global-styles/imported';
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

const notifySuccess = () => {
	notify( {
		id: SUCCESS_NOTIFICATION_ID,
		type: 'success',
		message: __( 'Importing Done', 'elementor' ),
	} );
};

const notifyFailure = () => {
	notify( {
		id: FAILURE_NOTIFICATION_ID,
		type: 'error',
		message: __( 'Failed to import design system. Please try again.', 'elementor' ),
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

			notifySuccess();
		} catch {
			notifyFailure();
		} finally {
			importDialogState.markIdle();
		}
	};
};
