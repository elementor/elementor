import { registerAction } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerAction( 'main', {
		name: 'open-user-preferences',
		priority: 19, // Before keyboard shortcuts.
		useProps: useActionProps,
	} );
}
