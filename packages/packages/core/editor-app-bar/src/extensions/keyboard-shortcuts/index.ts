import { mainMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerAction( {
		id: 'open-keyboard-shortcuts',
		group: 'default',
		priority: 40, // After user preferences.
		useProps: useActionProps,
	} );
}
