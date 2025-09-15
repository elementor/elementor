import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerAction( {
		id: 'open-keyboard-shortcuts',
		priority: 45,
		useProps: useActionProps,
	} );
}
