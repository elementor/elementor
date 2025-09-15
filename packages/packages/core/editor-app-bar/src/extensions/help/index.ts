import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerLink( {
		id: 'open-help-center',
		group: 'help',
		priority: 10,
		useProps: useActionProps,
	} );
}
