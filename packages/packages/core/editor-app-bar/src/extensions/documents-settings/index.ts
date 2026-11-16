import { isSidebarEnabled, sidebarFooter } from '@elementor/editor-sidebar';

import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	if ( isSidebarEnabled() ) {
		sidebarFooter.registerToggleAction( {
			id: 'document-settings-button',
			group: 'document',
			priority: 10,
			useProps: useActionProps,
		} );

		return;
	}

	toolsMenu.registerToggleAction( {
		id: 'document-settings-button',
		priority: 5,
		useProps: useActionProps,
	} );
}
