import PortedPrimaryAction from './components/ported-primary-action';
import { injectIntoTop } from '@elementor/editor';
import { registerToggleAction } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
	registerPrimaryAction();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'tools', {
		name: 'toggle-site-settings',
		priority: 2,
		useProps: useActionProps,
	} );
}

function registerPrimaryAction() {
	// This is portal, so it injected into the top of the editor, but renders inside the site-settings panel.
	injectIntoTop( {
		name: 'site-settings-primary-action-portal',
		filler: PortedPrimaryAction,
	} );
}
