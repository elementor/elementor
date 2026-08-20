import { __dispatch as dispatch } from '@elementor/store';

import { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
import { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
import { injectIntoFloatingPanels } from './location';
import { decodePersistedState } from './persistence';
import { slice } from './store/slice';
import { getPersistedState, isFloatingPanelsSyncInitialized, localStorageAdapter } from './sync';
import { type FloatingPanelDeclaration } from './types';

export function createFloatingPanel( declaration: FloatingPanelDeclaration ) {
	const persisted = isFloatingPanelsSyncInitialized()
		? getPersistedState( declaration.id )
		: decodePersistedState( localStorageAdapter.read() )[ declaration.id ];

	dispatch(
		slice.actions.register( {
			id: declaration.id,
			title: declaration.title,
			isDraggable: declaration.isDraggable,
			isResizable: declaration.isResizable,
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

export function registerFloatingPanel( declaration: Pick< FloatingPanelDeclaration, 'id' | 'component' > ): void {
	injectIntoFloatingPanels( { id: declaration.id, component: declaration.component } );
}
