import { utilitiesMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	utilitiesMenu.registerAction( {
		id: 'toggle-finder',
		priority: 15, // Before Preview.
		useProps: useActionProps,
	} );
}
