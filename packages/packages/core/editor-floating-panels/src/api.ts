import { __dispatch as dispatch } from '@elementor/store';

import { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
import { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
import { injectIntoFloatingPanels } from './location';
import { decodePersistedState } from './persistence';
import { slice } from './store/slice';
import { getPersistedState, isFloatingPanelsSyncInitialized, localStorageAdapter } from './sync';
import { type FloatingPanelDeclaration, type FloatingPanelState } from './types';
import { clamp } from './utils/clamp';
import { getDockedMaxInlineSize } from './utils/viewport-bounds';

function clampDockedPersistedWidth(
	declaration: FloatingPanelDeclaration,
	persisted: FloatingPanelState | undefined
): FloatingPanelState | undefined {
	if ( ! declaration.isDocked || ! persisted ) {
		return persisted;
	}

	const { minWidth } = declaration.defaults;
	const inlineSize = clamp( persisted.size.inlineSize, minWidth, getDockedMaxInlineSize( minWidth ) );

	return { ...persisted, size: { ...persisted.size, inlineSize } };
}

export function createFloatingPanel( declaration: FloatingPanelDeclaration ) {
	const persisted = clampDockedPersistedWidth(
		declaration,
		isFloatingPanelsSyncInitialized()
			? getPersistedState( declaration.id )
			: decodePersistedState( localStorageAdapter.read() )[ declaration.id ]
	);

	dispatch(
		slice.actions.register( {
			id: declaration.id,
			title: declaration.title,
			isDraggable: declaration.isDraggable,
			isResizable: declaration.isResizable,
			isDocked: declaration.isDocked,
			persistOpenState: declaration.persistOpenState,
			defaults: declaration.defaults,
			persisted,
		} )
	);

	return {
		panel: declaration,
		useFloatingPanelStatus: () => useFloatingPanelStatus( declaration.id ),
		useFloatingPanelActions: () => useFloatingPanelActions( declaration.id ),
	};
}

export function registerFloatingPanel(
	declaration: Pick< FloatingPanelDeclaration, 'id' | 'component' | 'keepMounted' >
): void {
	injectIntoFloatingPanels( {
		id: declaration.id,
		component: declaration.component,
		keepMounted: declaration.keepMounted,
	} );
}

export function openFloatingPanel( id: string ): void {
	dispatch( slice.actions.open( id ) );
	dispatch( slice.actions.bringToFront( id ) );
}

export function closeFloatingPanel( id: string ): void {
	dispatch( slice.actions.close( id ) );
}
