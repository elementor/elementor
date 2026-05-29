import { registerFloatingPanel } from '@elementor/editor-floating-panels';
import { __registerSlice as registerSlice } from '@elementor/store';

import { registerBuiltInAudits } from './audits/register-built-ins';
import { registerAuditToolbarToggle } from './components/audit-toolbar-toggle';
import { auditPanel } from './panel-instance';
import { slice } from './store/slice';

export function init(): void {
	registerSlice( slice );
	registerBuiltInAudits();
	registerFloatingPanel( auditPanel.panel );
	registerAuditToolbarToggle();
}
