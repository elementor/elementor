import { registerToggleAction } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'main', {
		name: 'open-history',
		priority: 20,
		useProps: useActionProps,
	} );
}
