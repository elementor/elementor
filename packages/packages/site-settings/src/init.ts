import PortalledPrimaryAction from './components/portalled-primary-action';
import { injectIntoTop } from '@elementor/editor';
import { toolsMenu } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
	registerPrimaryAction();
}

function registerTopBarMenuItems() {
	toolsMenu.registerToggleAction( {
		name: 'toggle-site-settings',
		priority: 2,
		useProps: useActionProps,
	} );
}

function registerPrimaryAction() {
	// This is portal, so it injected into the top of the editor, but renders inside the site-settings panel.
	injectIntoTop( {
		name: 'site-settings-primary-action-portal',
		filler: PortalledPrimaryAction,
	} );
}
