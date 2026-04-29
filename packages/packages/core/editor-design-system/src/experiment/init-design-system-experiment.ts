import { injectIntoLogic } from '@elementor/editor';
import { toolsMenu } from '@elementor/editor-app-bar';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';

import { panel } from '../design-system-panel';
import { OpenDesignSystemFromEvent } from '../components/open-design-system-from-event';
import { OpenDesignSystemFromUrl } from '../components/open-design-system-from-url';
import { useOpenDesignSystemToolbar } from '../use-open-design-system-toolbar';

export function initDesignSystemExperiment() {
	registerPanel( panel );

	injectIntoLogic( {
		id: 'design-system-open-from-url',
		component: OpenDesignSystemFromUrl,
	} );

	// injectIntoLogic( {
	// 	id: 'global-classes-sync-with-document',
	// 	component: SyncGlobalClassesWithDocument,
	// } );

	injectIntoLogic( {
		id: 'variables-open-design-system-from-event',
		component: OpenDesignSystemFromEvent,
	} );


	toolsMenu.registerToggleAction( {
		id: 'open-design-system-toolbar',
		priority: 16,
		useProps: useOpenDesignSystemToolbar,
	} );
}
