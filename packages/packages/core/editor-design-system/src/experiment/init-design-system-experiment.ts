import { injectIntoLogic } from '@elementor/editor';
import { toolsMenu } from '@elementor/editor-app-bar';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';

import { DesignSystemEntrypoints } from '../components/design-system-entrypoints';
import { panel } from '../design-system-panel';
import { useOpenDesignSystemToolbar } from '../use-open-design-system-toolbar';

export function initDesignSystemExperiment() {
	registerPanel( panel );

	injectIntoLogic( {
		id: 'design-system-entrypoints',
		component: DesignSystemEntrypoints,
	} );

	toolsMenu.registerToggleAction( {
		id: 'open-design-system-toolbar',
		priority: 21,
		useProps: useOpenDesignSystemToolbar,
	} );
}
