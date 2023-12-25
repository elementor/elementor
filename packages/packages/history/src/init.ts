import { mainMenu } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	mainMenu.registerToggleAction( {
		name: 'open-history',
		priority: 20,
		useProps: useActionProps,
	} );
}
