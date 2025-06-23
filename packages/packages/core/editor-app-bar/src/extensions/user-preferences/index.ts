import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerToggleAction( {
		id: 'open-user-preferences',
		priority: 30, // After history.
		useProps: useActionProps,
	} );
}
