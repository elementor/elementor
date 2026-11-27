import { injectIntoLogic } from '@elementor/editor';
import { toolsMenu } from '@elementor/editor-app-bar';
import { registerPanel } from '@elementor/editor-panels';
import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';

import { DesignSystemEntrypoints } from './components/design-system-entrypoints';
import { panel } from './design-system-panel';
import { useOpenDesignSystemToolbar } from './use-open-design-system-toolbar';
import { useSidebarDesignSystemProps } from './use-sidebar-design-system-props';

export function init() {
	registerPanel( panel );

	injectIntoLogic( {
		id: 'design-system-entrypoints',
		component: DesignSystemEntrypoints,
	} );

	if ( isSidebarEnabled() ) {
		sidebarTools.registerToggleAction( {
			id: 'open-design-system-toolbar',
			group: 'design',
			priority: 4,
			useProps: useSidebarDesignSystemProps,
		} );

		return;
	}

	toolsMenu.registerToggleAction( {
		id: 'open-design-system-toolbar',
		priority: 4,
		useProps: useOpenDesignSystemToolbar,
	} );
}
