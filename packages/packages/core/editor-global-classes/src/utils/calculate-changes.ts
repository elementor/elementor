import { hash } from '@elementor/utils';

import { type GlobalClasses } from '../store';

export function calculateChanges( state: GlobalClasses, initialData: GlobalClasses ) {
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
