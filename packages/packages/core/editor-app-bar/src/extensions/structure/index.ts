import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	toolsMenu.registerToggleAction( {
		id: 'toggle-structure-view',
		priority: 3,
		useProps: useActionProps,
	} );
}
