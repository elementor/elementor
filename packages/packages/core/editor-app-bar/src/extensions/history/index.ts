import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerToggleAction( {
		id: 'open-history',
		priority: 20,
		useProps: useActionProps,
	} );
}
