import { canUseAngiePluginSidebar } from '@elementor/editor-angie';
import { utilitiesMenu } from '@elementor/editor-app-bar';

import { ANGIE_TOGGLE_ID, ANGIE_TOGGLE_PRIORITY } from './constants';
import { useAngieToggleProps } from './hooks/use-angie-toggle-props';

export function registerAppBarAngieToggle(): void {
	if ( canUseAngiePluginSidebar() ) {
		return;
	}

	utilitiesMenu.registerToggleAction( {
		id: ANGIE_TOGGLE_ID,
		priority: ANGIE_TOGGLE_PRIORITY,
		useProps: useAngieToggleProps,
	} );
}
