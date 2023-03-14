import useActionProps from './hooks/use-action-props';
import { mainMenu } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	mainMenu.registerToggleAction( {
		name: 'open-user-preferences',
		priority: 30, // After history.
		useProps: useActionProps,
	} );
}
