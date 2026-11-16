import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';

import { mainMenu } from '../../locations';
import useThemeBuilderActionProps from './hooks/use-action-props';

export function init() {
	if ( isSidebarEnabled() ) {
		sidebarTools.registerAction( {
			id: 'open-theme-builder',
			priority: 10,
			useProps: useThemeBuilderActionProps,
		} );

		return;
	}

	mainMenu.registerAction( {
		id: 'open-theme-builder',
		group: 'default',
		priority: 10,
		useProps: useThemeBuilderActionProps,
	} );
}
