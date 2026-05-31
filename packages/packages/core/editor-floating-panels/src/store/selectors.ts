import { __createSelector } from '@elementor/store';

import { type FloatingPanelsSliceState } from './slice';

export type GlobalState = { floatingPanels: FloatingPanelsSliceState };

export function selectPanelState( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ];
}

export function selectIsOpen( state: GlobalState, id: string ): boolean {
	return state.floatingPanels.byId[ id ]?.isOpen ?? false;
}

export function selectPosition( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.position;
}

export function selectSize( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.size;
}

export function selectMinSize( state: GlobalState, id: string ) {
	return state.floatingPanels.minSizeById[ id ];
}

export function selectTopZIndex( state: GlobalState ): number {
	return state.floatingPanels.topZIndex;
}

export const selectOpenPanelIds = __createSelector( [ ( state: GlobalState ) => state.floatingPanels.byId ], ( byId ) =>
	Object.entries( byId )
		.filter( ( [ , panel ] ) => panel.isOpen )
		.sort( ( [ , a ], [ , b ] ) => a.zIndex - b.zIndex )
		.map( ( [ id ] ) => id )
);
