import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { apiClient, type ApiContext } from './api';
import { type GlobalClasses, selectData, selectFrontendInitialData, selectPreviewInitialData, slice } from './store';

type Options = {
	context: ApiContext;
};

export async function saveGlobalClasses( { context }: Options ) {
	const state = selectData( getState() );

	if ( context === 'preview' ) {
		await apiClient.saveDraft( {
			items: state.items,
			order: state.order,
			changes: calculateChanges( state, selectPreviewInitialData( getState() ) ),
		} );
	} else {
		await apiClient.publish( {
			items: state.items,
			order: state.order,
			changes: calculateChanges( state, selectFrontendInitialData( getState() ) ),
		} );
	}

	dispatch( slice.actions.reset( { context } ) );
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
