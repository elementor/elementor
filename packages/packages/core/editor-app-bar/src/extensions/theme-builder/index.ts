import { mainMenu } from '../../locations';
import useThemeBuilderActionProps from './hooks/use-action-props';

export function init() {
	mainMenu.registerAction( {
		id: 'open-theme-builder',
		useProps: useThemeBuilderActionProps,
	} );
}
