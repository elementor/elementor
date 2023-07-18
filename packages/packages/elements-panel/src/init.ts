import { syncPanelTitle } from './sync';
import useActionProps from './hooks/use-action-props';
import { toolsMenu } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();

	syncPanelTitle();
}

function registerTopBarMenuItems() {
	toolsMenu.registerToggleAction( {
		name: 'open-elements-panel',
		priority: 1,
		useProps: useActionProps,
	} );
}
