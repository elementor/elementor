import { toolsMenu } from '../../locations';
import useActionProps from './hooks/use-action-props';

export function init() {
	toolsMenu.registerToggleAction( {
		id: 'document-settings-button',
		priority: 5,
		useProps: useActionProps,
	} );
}
