import { injectIntoTop } from '@elementor/editor';

import { toolsMenu } from '../../locations';
import PortalledPrimaryAction from './components/portalled-primary-action';
import useActionProps from './hooks/use-action-props';

export function init() {
	// This is portal, so it injected into the top of the editor, but renders inside the site-settings panel.
	injectIntoTop( {
		id: 'site-settings-primary-action-portal',
		component: PortalledPrimaryAction,
	} );

	toolsMenu.registerToggleAction( {
		id: 'toggle-site-settings',
		priority: 2,
		useProps: useActionProps,
	} );
}
