import { __createSelector, __useSelector as useSelector } from '@elementor/store';

import { type GlobalState, selectCorner, selectIsOpen, selectPosition, selectSize } from '../store/selectors';

const selectStatus = __createSelector(
	[
		( state: GlobalState, id: string ) => selectIsOpen( state, id ),
		( state: GlobalState, id: string ) => selectCorner( state, id ),
		( state: GlobalState, id: string ) => selectPosition( state, id ),
		( state: GlobalState, id: string ) => selectSize( state, id ),
	],
	( isOpen, corner, position, size ) => ( { isOpen, corner, position, size } )
);

export function useFloatingPanelStatus( id: string ) {
	return useSelector( ( state: GlobalState ) => selectStatus( state, id ) );
}
