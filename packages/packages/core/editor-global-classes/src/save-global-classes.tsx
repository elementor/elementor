import * as React from 'react';
import { openDialog } from '@elementor/editor-ui';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { API_ERROR_CODES, apiClient, type ApiContext } from './api';
import { DuplicateLabelDialog } from './components/class-manager/duplicate-label-dialog';
import { type GlobalClasses, selectData, selectFrontendInitialData, selectPreviewInitialData, slice } from './store';
import { trackGlobalClasses } from './utils/tracking';

type Options = {
	context: ApiContext;
	onApprove?: () => void;
};

export async function saveGlobalClasses( { context, onApprove }: Options ) {
	const state = selectData( getState() );
	const apiAction = context === 'preview' ? apiClient.saveDraft : apiClient.publish;
	const currentContext = context === 'preview' ? selectPreviewInitialData : selectFrontendInitialData;
	const response = await apiAction( {
		items: state.items,
		order: state.order,
		changes: calculateChanges( state, currentContext( getState() ) ),
	} );

	dispatch( slice.actions.reset( { context } ) );
	if ( response?.data?.data?.code === API_ERROR_CODES.DUPLICATED_LABEL ) {
		dispatch( slice.actions.updateMultiple( response.data.data.modifiedLabels ) );
		trackGlobalClasses( {
			event: 'classPublishConflict',
			numOfConflicts: Object.keys( response.data.data.modifiedLabels ).length,
		} );
		openDialog( {
			component: (
				<DuplicateLabelDialog
					modifiedLabels={ response.data.data.modifiedLabels || [] }
					onApprove={ onApprove }
				/>
			),
		} );
	}
}

function calculateChanges( state: GlobalClasses, initialData: GlobalClasses ) {
	const stateIds = Object.keys( state.items );
	const initialDataIds = Object.keys( initialData.items );

	return {
		added: stateIds.filter( ( id ) => ! initialDataIds.includes( id ) ),
		deleted: initialDataIds.filter( ( id ) => ! stateIds.includes( id ) ),
		modified: stateIds.filter( ( id ) => {
			return id in initialData.items && hash( state.items[ id ] ) !== hash( initialData.items[ id ] );
		} ),
	};
}
