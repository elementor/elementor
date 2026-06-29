import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	toolsMenu.registerToggleAction( {
		id: 'open-history',
		priority: 15,
		useProps: useActionProps,
	} );
}
