import { __createSelector } from '@elementor/store';

import { FLOATING_PANEL_Z_INDEX_BASE } from '../constants';
import { type FloatingPanelsSliceState } from './slice';

export type GlobalState = { floatingPanels: FloatingPanelsSliceState };

export function selectPanelState( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ];
}

export function resolvePanelZIndex( state: GlobalState, id: string ): number {
	return FLOATING_PANEL_Z_INDEX_BASE + ( state.floatingPanels.byId[ id ]?.zIndex ?? 0 );
}

export function resolveOverlayZIndex( state: GlobalState, id: string ): number {
	return resolvePanelZIndex( state, id ) + 1;
}

export function selectIsOpen( state: GlobalState, id: string ): boolean {
	return state.floatingPanels.byId[ id ]?.isOpen ?? false;
}

export function selectCorner( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.corner;
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

export function selectIsDraggable( state: GlobalState, id: string ): boolean {
	return state.floatingPanels.isDraggableById[ id ] ?? false;
}

export function selectIsResizable( state: GlobalState, id: string ): boolean {
	return state.floatingPanels.isResizableById[ id ] ?? false;
}

export function selectPanelTitle( state: GlobalState, id: string ): string | undefined {
	return state.floatingPanels.titlesById[ id ];
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
