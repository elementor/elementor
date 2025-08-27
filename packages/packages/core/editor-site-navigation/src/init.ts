import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';
import { __registerPanel } from '@elementor/editor-panels';

import { panel } from './components/panel/panel';
import RecentlyEdited from './components/top-bar/recently-edited';
import { env } from './env';
import { useToggleButtonProps } from './hooks/use-toggle-button-props';

export function init() {
	registerTopBarMenuItems();
	// TODO 06/06/2023 :  remove if when we are production ready
	if ( env.is_pages_panel_active ) {
		__registerPanel( panel );
		registerButton();
	}
}

function registerTopBarMenuItems() {
	injectIntoPageIndication( {
		id: 'document-recently-edited',
		component: RecentlyEdited,
	} );
}

function registerButton() {
	toolsMenu.registerToggleAction( {
		id: 'toggle-site-navigation-panel',
		priority: 2,
		useProps: useToggleButtonProps,
	} );
}
