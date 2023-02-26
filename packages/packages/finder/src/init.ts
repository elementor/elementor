import useActionProps from './hooks/use-action-props';
import { registerToggleAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'utilities', {
		name: 'toggle-finder',
		priority: 10,
		useProps: () => useActionProps(),
	} );
}
