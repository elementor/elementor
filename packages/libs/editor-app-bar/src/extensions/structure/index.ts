import { utilitiesMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	utilitiesMenu.registerToggleAction( {
		id: 'toggle-structure-view',
		priority: 25,
		useProps: useActionProps,
	} );
}
