import * as React from 'react';
import { getCurrentDocument } from '@elementor/editor-documents';
import { notify } from '@elementor/editor-notifications';
import { openDialog } from '@elementor/editor-ui';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { API_ERROR_CODES, apiClient, type ApiContext, isConflictError } from './api';
import { DuplicateLabelDialog } from './components/class-manager/duplicate-label-dialog';
import { styleDefinitionsMapWithoutNull } from './load-document-classes';
import {
	type GlobalClasses,
	selectData,
	selectFrontendInitialData,
	selectPreviewInitialData,
	selectVersion,
	slice,
} from './store';
import { calculateChanges } from './utils/calculate-changes';
import { createLabelsForClasses } from './utils/create-labels-for-classes';
import { trackGlobalClasses } from './utils/tracking';

type Options = {
	context: ApiContext;
	onApprove?: () => void;
};

const CLASSES_CONFLICT_EVENT = 'classes:conflict';
const CONFLICT_NOTIFICATION_ID = 'global-classes-save-conflict';

export async function saveGlobalClasses( { context, onApprove }: Options ) {
	let lastResponse;

	try {
		lastResponse = await persistGlobalClasses( context );
	} catch ( error ) {
		// The save was based on a stale snapshot: another save already changed the
		// kit's classes since this client's last index read. Nothing was written.
		// Re-fetch the server state, re-apply the unsaved edits on top of it,
		// and retry once.
		if ( ! isConflictError( error ) ) {
			throw error;
		}

		window.dispatchEvent( new CustomEvent( CLASSES_CONFLICT_EVENT ) );

		await rebaseToServer( context );

		try {
			lastResponse = await persistGlobalClasses( context );
		} catch ( retryError ) {
			if ( isConflictError( retryError ) ) {
				notifyConflict();
			}

			throw retryError;
		}
	}

	if ( lastResponse?.data?.data?.code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		dispatch( slice.actions.updateMultiple( lastResponse.data.data.modifiedLabels ) );

		trackGlobalClasses( {
			event: 'classPublishConflict',
			numOfConflicts: Object.keys( lastResponse.data.data.modifiedLabels ).length,
		} );

		openDialog( {
			component: (
				<DuplicateLabelDialog
					modifiedLabels={ lastResponse.data.data.modifiedLabels || [] }
					onApprove={ onApprove }
				/>
			),
		} );
	}
}

async function persistGlobalClasses( context: ApiContext ) {
	const apiAction = context === 'preview' ? apiClient.saveDraft : apiClient.publish;
	const currentContext = context === 'preview' ? selectPreviewInitialData : selectFrontendInitialData;

	const state = selectData( getState() );
	const changes = calculateChanges( state, currentContext( getState() ) );

	const touchedIds = [ ...changes.added, ...changes.modified ];
	const touchedItems = Object.fromEntries(
		touchedIds.map( ( id ) => [ id, state.items[ id ] ] ).filter( ( [ , v ] ) => v )
	);

	const version = selectVersion( getState() );

	const response = await apiAction( {
		items: touchedItems,
		order: state.order,
		changes,
		version,
	} );

	// The server accepted the save, so it is the new baseline, and the server advanced its version by one.
	// A duplicate-label response still carries label changes, which the caller applies on top of this baseline.
	dispatch( slice.actions.reset( { context } ) );
	dispatch( slice.actions.setVersion( version + 1 ) );

	window.dispatchEvent( new CustomEvent( 'classes:updated', { detail: { context } } ) );

	return response;
}

async function rebaseToServer( context: ApiContext ) {
	const documentId = getCurrentDocument()?.id;

	const [ serverIndexRes, serverPostRes ] = await Promise.all( [
		apiClient.all( context ),
		documentId ? apiClient.getStylesForPost( documentId, context ) : Promise.resolve( null ),
	] );

	const server: GlobalClasses = {
		items: serverPostRes ? styleDefinitionsMapWithoutNull( serverPostRes.data.data ) : {},
		order: serverIndexRes.data.data.map( ( entry ) => entry.id ),
	};

	dispatch(
		slice.actions.rebaseToServer( {
			context,
			server,
			serverLabels: createLabelsForClasses( serverIndexRes.data.data ),
			version: serverIndexRes.data.meta.version ?? 0,
		} )
	);
}

function notifyConflict() {
	notify( {
		type: 'error',
		id: CONFLICT_NOTIFICATION_ID,
		message: __(
			'Your classes were not saved because they changed somewhere else. Refresh the page to load the latest classes.',
			'elementor'
		),
	} );
}
