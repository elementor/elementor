import useActionProps from './hooks/use-action-props';
import { utilitiesMenu } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	utilitiesMenu.registerToggleAction( {
		name: 'toggle-finder',
		priority: 10, // Before help.
		useProps: () => useActionProps(),
	} );
}
