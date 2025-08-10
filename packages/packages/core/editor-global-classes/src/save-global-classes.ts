import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { apiClient, type ApiContext } from './api';
import { showErrorDialog } from './components/error-dialog-controler';
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
	} catch ( e: unknown ) {}
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

type UnknownObject = Record< string, unknown >;

// Inspired by:
// https://github.com/TanStack/query/blob/66ea5f2fc/packages/query-core/src/utils.ts#L212
function hash( obj: UnknownObject ): string {
	return JSON.stringify( obj, ( _, value ) =>
		isPlainObject( value )
			? Object.keys( value )
					.sort()
					.reduce< UnknownObject >( ( result, key ) => {
						result[ key ] = value[ key ];

						return result;
					}, {} )
			: value
	);
}

function isPlainObject( value: unknown ): value is UnknownObject {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}
