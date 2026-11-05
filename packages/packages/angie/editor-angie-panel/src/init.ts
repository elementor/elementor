import { registerAngiePanelOpener } from '@elementor/editor-angie';
import { openFloatingPanel, registerFloatingPanel } from '@elementor/editor-floating-panels';

import { ANGIE_PANEL_ID } from './constants';
import { registerAppBarAngieToggle } from './editor-app-bar';
import { angiePanel } from './editor-panel';
import { registerHelpCenterAction } from './help-center';

export function init(): void {
	registerAngiePanelOpener( () => openFloatingPanel( ANGIE_PANEL_ID ) );
	registerFloatingPanel( angiePanel.panel );
	registerAppBarAngieToggle();
	registerHelpCenterAction();
}
