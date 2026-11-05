import { mainMenu } from '@elementor/editor-app-bar';

import { useHelpCenterProps } from './hooks/use-help-center-props';

export function registerHelpCenterAction(): void {
	mainMenu.registerLink( {
		id: 'open-help-center',
		group: 'help',
		priority: 10,
		overwrite: true,
		useProps: useHelpCenterProps,
	} );
}
