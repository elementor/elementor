import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerAction( {
		id: 'open-keyboard-shortcuts',
		group: 'help',
		useProps: useActionProps,
	} );
}
