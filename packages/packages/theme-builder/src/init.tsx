import { mainMenu } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	mainMenu.registerAction( {
		name: 'open-theme-builder',
		useProps: useActionProps,
	} );
}
