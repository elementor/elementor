import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';

import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';
import syncPanelTitle from './sync/sync-panel-title';

export function init() {
	syncPanelTitle();

	if ( isSidebarEnabled() ) {
		sidebarTools.registerToggleAction( {
			id: 'open-elements-panel',
			group: 'elements',
			priority: 1,
			useProps: useActionProps,
		} );

		return;
	}

	toolsMenu.registerToggleAction( {
		id: 'open-elements-panel',
		priority: 1,
		useProps: useActionProps,
	} );
}
