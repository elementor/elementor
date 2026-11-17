import { isSidebarEnabled, sidebarFooter } from '@elementor/editor-sidebar';

import { mainMenu } from '../../locations';
import SidebarHelp from './components/sidebar-help';
import useActionProps from './hooks/use-action-props';

export function init() {
	if ( isSidebarEnabled() ) {
		sidebarFooter.registerCustom( {
			id: 'open-help-center',
			priority: 40,
			props: { component: SidebarHelp },
		} );

		return;
	}

	mainMenu.registerLink( {
		id: 'open-help-center',
		group: 'help',
		priority: 10,
		useProps: useActionProps,
	} );
}
