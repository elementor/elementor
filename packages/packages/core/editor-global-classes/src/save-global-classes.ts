import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { apiClient, type ApiContext } from './api';
import { showErrorDialog } from './components/show-error-dialog';
import { type GlobalClasses, selectData, selectFrontendInitialData, selectPreviewInitialData, slice } from './store';

type Options = {
	context: ApiContext;
};

export async function saveGlobalClasses( { context }: Options ) {
	const state = selectData( getState() );
	const apiAction = context === 'preview' ? apiClient.saveDraft : apiClient.publish;
	const currentContext = context === 'preview' ? selectPreviewInitialData : selectFrontendInitialData;
	try {
		const response = await apiAction( {
			items: state.items,
			order: state.order,
			changes: calculateChanges( state, currentContext( getState() ) ),
		} );
		dispatch( slice.actions.reset( { context } ) );
		if ( response.data.data ) {
			showErrorDialog( response.data.data );
		}
	} catch {
		// Remove console statement as it violates no-console eslint rule
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
