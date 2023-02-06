import useProps from './hooks/use-props';
import { registerToggleAction } from '@elementor/top-bar';

export default function init() {
	registerTopBarMenuItems();
}

function registerTopBarMenuItems() {
	registerToggleAction( 'tools', {
		name: 'open-elements-panel',
		useProps,
	} );
}
