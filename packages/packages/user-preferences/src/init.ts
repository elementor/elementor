import useActionProps from './hooks/use-action-props';
import { registerToggleAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'main', {
		name: 'open-user-preferences',
		priority: 19, // Before keyboard shortcuts.
		useProps: useActionProps,
	} );
}
