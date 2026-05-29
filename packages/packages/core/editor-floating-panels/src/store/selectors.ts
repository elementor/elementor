import { type FloatingPanelsSliceState } from './slice';

type GlobalState = { floatingPanels: FloatingPanelsSliceState };

export function selectPanelState( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ];
}

export function selectIsOpen( state: GlobalState, id: string ): boolean {
	return state.floatingPanels.byId[ id ]?.isOpen ?? false;
}

export function selectMode( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.mode;
}

export function selectPosition( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.position;
}

export function selectSize( state: GlobalState, id: string ) {
	return state.floatingPanels.byId[ id ]?.size;
}

export function selectTopZIndex( state: GlobalState ): number {
	return state.floatingPanels.topZIndex;
}

export function selectOpenPanelIds( state: GlobalState ): string[] {
	return Object.entries( state.floatingPanels.byId )
		.filter( ( [ , panel ] ) => panel.isOpen )
		.sort( ( [ , a ], [ , b ] ) => a.zIndex - b.zIndex )
		.map( ( [ id ] ) => id );
}
