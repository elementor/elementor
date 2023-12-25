import { toolsMenu } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	toolsMenu.registerToggleAction( {
		name: 'toggle-structure-view',
		priority: 3,
		useProps: () => useActionProps(),
	} );
}
