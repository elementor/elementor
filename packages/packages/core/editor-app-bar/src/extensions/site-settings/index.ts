import { injectIntoTop } from '@elementor/editor';

import { mainMenu } from '../../locations';
import PortalledPrimaryAction from './components/portalled-primary-action';
import useActionProps from './hooks/use-action-props';

export function init() {
	// This is portal, so it injected into the top of the editor, but renders inside the site-settings panel.
	injectIntoTop( {
		id: 'site-settings-primary-action-portal',
		component: PortalledPrimaryAction,
	} );

	mainMenu.registerToggleAction( {
		id: 'toggle-site-settings',
		group: 'default',
		priority: 1,
		useProps: useActionProps,
	} );
}
