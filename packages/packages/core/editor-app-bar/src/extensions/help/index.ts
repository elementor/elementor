import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerLink( {
		id: 'open-help-center',
		priority: 45,
		useProps: useActionProps,
	} );
}
