import { registerToggleAction } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'tools', {
		name: 'toggle-structure-view',
		useProps: () => useActionProps(),
	} );
}
