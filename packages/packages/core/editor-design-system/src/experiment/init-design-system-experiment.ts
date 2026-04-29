import { toolsMenu } from '@elementor/editor-app-bar';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';

import { panel } from '../design-system-panel';
import { useOpenDesignSystemToolbar } from '../use-open-design-system-toolbar';

export function initDesignSystemExperiment() {
	registerPanel( panel );

	toolsMenu.registerToggleAction( {
		id: 'open-design-system-toolbar',
		priority: 16,
		useProps: useOpenDesignSystemToolbar,
	} );
}
