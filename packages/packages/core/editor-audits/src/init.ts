import { registerFloatingPanel } from '@elementor/editor-floating-panels';
import { __registerSlice as registerSlice } from '@elementor/store';

import { registerAllAudits } from './audits/register-built-ins';
import { registerAppBarAuditsToggle } from './editor-app-bar';
import { auditPanel } from './editor-panel';
import { slice } from './store/slice';

export function init(): void {
	registerSlice( slice );
	registerAllAudits();
	registerFloatingPanel( auditPanel.panel );
	registerAppBarAuditsToggle();
}
