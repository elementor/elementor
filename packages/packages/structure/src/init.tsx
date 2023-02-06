import { registerToggleAction } from '@elementor/top-bar';
import useActionProps from './hooks/use-action-props';

registerToggleAction( 'tools', {
	name: 'toggle-structure-view',
	useProps: () => useActionProps(),
} );
