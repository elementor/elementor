import { syncPanelTitle } from './sync';
import useActionProps from './hooks/use-action-props';
import { registerToggleAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();

	syncPanelTitle();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'tools', {
		name: 'open-elements-panel',
		useProps: useActionProps,
	} );
}
