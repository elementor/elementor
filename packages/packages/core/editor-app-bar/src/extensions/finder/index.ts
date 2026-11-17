import { isSidebarEnabled, sidebarFooter } from '@elementor/editor-sidebar';

import { utilitiesMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	if ( isSidebarEnabled() ) {
		sidebarFooter.registerAction( {
			id: 'toggle-finder',
			priority: 30,
			useProps: useActionProps,
		} );

		return;
	}

	utilitiesMenu.registerAction( {
		id: 'toggle-finder',
		priority: 15,
		useProps: useActionProps,
	} );
}
