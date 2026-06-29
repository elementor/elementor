import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerToggleAction( {
		id: 'open-user-preferences',
		group: 'default',
		priority: 30,
		useProps: useActionProps,
	} );
}
