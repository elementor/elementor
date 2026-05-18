import { injectIntoLogic } from '@elementor/editor';
import { toolsMenu } from '@elementor/editor-app-bar';
import { registerGoToClassManager } from '@elementor/editor-editing-panel';
import {
	registerClassManagerOpen,
	registerClassManagerToggle,
} from '@elementor/editor-global-classes';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { registerOpenVariablesSettings } from '@elementor/editor-variables';

import { DesignSystemEntrypoints } from './components/design-system-entrypoints';
import { panel } from './design-system-panel';
import {
	EVENT_OPEN_CLASSES,
	EVENT_TOGGLE_DESIGN_SYSTEM,
} from './events';
import { useOpenDesignSystemToolbar } from './use-open-design-system-toolbar';

const dispatchToggle = ( tab: 'classes' | 'variables' ) => () =>
	window.dispatchEvent( new CustomEvent( EVENT_TOGGLE_DESIGN_SYSTEM, { detail: { tab } } ) );

export function init() {
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

	registerClassManagerToggle( dispatchToggle( 'classes' ) );
	registerClassManagerOpen( () => window.dispatchEvent( new CustomEvent( EVENT_OPEN_CLASSES ) ) );
	registerGoToClassManager( dispatchToggle( 'classes' ) );
	registerOpenVariablesSettings( dispatchToggle( 'variables' ) );
}
