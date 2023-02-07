import useActionProps from './hooks/use-action-props';
import { registerToggleAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'tools', {
		name: 'open-elements-panel',
		useProps: useActionProps,
	} );
}
