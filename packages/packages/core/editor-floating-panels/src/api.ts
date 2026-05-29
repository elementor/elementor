import { __dispatch as dispatch } from '@elementor/store';

import { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
import { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
import { injectIntoFloatingPanels } from './location';
import { slice } from './store/slice';
import { getPersistedState } from './sync';
import { type FloatingPanelDeclaration } from './types';

export function createFloatingPanel( declaration: FloatingPanelDeclaration ) {
	dispatch(
		slice.actions.register( {
			id: declaration.id,
			defaults: declaration.defaults,
			persisted: getPersistedState( declaration.id ),
		} )
	);

	return {
		panel: declaration,
		useFloatingPanelStatus: () => useFloatingPanelStatus( declaration.id ),
		useFloatingPanelActions: () => useFloatingPanelActions( declaration.id ),
	};
}

export function registerFloatingPanel(
	declaration: Pick< FloatingPanelDeclaration, 'id' | 'component' | 'icon' | 'title' >
): void {
	injectIntoFloatingPanels( declaration );
}
