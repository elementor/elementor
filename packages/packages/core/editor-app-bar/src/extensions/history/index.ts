import { isSidebarEnabled, sidebarFooter } from '@elementor/editor-sidebar';

import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	if ( isSidebarEnabled() ) {
		sidebarFooter.registerToggleAction( {
			id: 'open-history',
			group: 'document',
			priority: 20,
			useProps: useActionProps,
		} );

		return;
	}

	toolsMenu.registerToggleAction( {
		id: 'open-history',
		priority: 3,
		useProps: useActionProps,
	} );
}
