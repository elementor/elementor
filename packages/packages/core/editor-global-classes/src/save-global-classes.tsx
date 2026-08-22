import * as React from 'react';
import { getCurrentDocument } from '@elementor/editor-documents';
import { openDialog } from '@elementor/editor-ui';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { API_ERROR_CODES, apiClient, isConflictError, type ApiContext } from './api';
import { DuplicateLabelDialog } from './components/class-manager/duplicate-label-dialog';
import {
	type GlobalClasses,
	selectData,
	selectFrontendInitialData,
	selectPreviewInitialData,
	selectVersion,
	slice,
} from './store';
import { styleDefinitionsMapWithoutNull } from './load-document-classes';
import { trackGlobalClasses } from './utils/tracking';

type Options = {
	context: ApiContext;
	onApprove?: () => void;
};

const INDEX_ORDER_CONFLICT_EVENT = 'classes:conflict';

export async function saveGlobalClasses( { context, onApprove }: Options ) {
	let lastResponse;

	try {
		lastResponse = await persistGlobalClasses( { context, onApprove } );
	} catch ( error ) {
		// The save was based on a stale snapshot: another save already changed the
		// kit's classes since this client's last index read. Re-fetch, rebase, re-diff
		// and retry once against the fresh baseline. A class whose loss had already
		// committed on the server is re-added by the re-diff (self-heal).
		if ( ! isConflictError( error ) ) {
			throw error;
		}

		window.dispatchEvent( new CustomEvent( INDEX_ORDER_CONFLICT_EVENT ) );

		await rebaseToServer( context );

		lastResponse = await persistGlobalClasses( { context, onApprove } );
	}

	if (
		lastResponse?.data?.data?.code === API_ERROR_CODES.DUPLICATED_LABEL
	) {
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

async function persistGlobalClasses( { context, onApprove }: Options ) {
	const apiAction = context === 'preview' ? apiClient.saveDraft : apiClient.publish;
	const currentContext = context === 'preview' ? selectPreviewInitialData : selectFrontendInitialData;

	const state = selectData( getState() );
	const changes = calculateChanges( state, currentContext( getState() ) );

	const touchedIds = [ ...changes.added, ...changes.modified ];
	const touchedItems = Object.fromEntries(
		touchedIds.map( ( id ) => [ id, state.items[ id ] ] ).filter( ( [ , v ] ) => v )
	);

	const response = await apiAction( {
		items: touchedItems,
		order: state.order,
		changes,
		version: selectVersion( getState(), context ),
	} );

	// A successful save establishes the new baseline, unless a duplicate-label
	// response carried server-side label modifications that must be folded in first.
	if ( response?.data?.data?.code !== API_ERROR_CODES.DUPLICATED_LABEL ) {
		dispatch( slice.actions.reset( { context } ) );
	}

	window.dispatchEvent( new CustomEvent( 'classes:updated', { detail: { context } } ) );

	return response;
}

async function rebaseToServer( context: ApiContext ) {
	const [ serverIndexRes, serverPostRes ] = await Promise.all( [
		apiClient.all( context ),
		getCurrentDocument()?.id
			? apiClient.getStylesForPost( getCurrentDocument().id, context )
			: Promise.resolve( null ),
	] );

	if ( ! serverPostRes ) {
		return;
	}

	const serverItems = styleDefinitionsMapWithoutNull( serverPostRes.data.data );
	const server: GlobalClasses = {
		items: serverItems,
		order: serverIndexRes.data.data.map( ( entry ) => entry.id ),
	};

	dispatch(
		slice.actions.rebaseToServer( {
			context,
			server,
			version: serverIndexRes.data.meta.version ?? 0,
		} )
	);
}

function calculateChanges( state: GlobalClasses, initialData: GlobalClasses ) {
	const stateIds = Object.keys( state.items );
	const initialDataIds = Object.keys( initialData.items );

	const { order: stateOrder } = state;
	const { order: initialDataOrder } = initialData;

	const stateOrderIdSet = new Set( stateOrder );
	const deleted = initialDataOrder.filter( ( id ) => ! stateOrderIdSet.has( id ) );

	const order = stateOrder.join( ';' ) !== initialDataOrder.join( ';' );

	return {
		added: stateIds.filter( ( id ) => ! initialDataIds.includes( id ) ),
		deleted,
		modified: stateIds.filter( ( id ) => {
			return id in initialData.items && hash( state.items[ id ] ) !== hash( initialData.items[ id ] );
		} ),
		order,
	};
}
