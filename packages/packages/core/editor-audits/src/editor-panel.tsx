import { createFloatingPanel } from '@elementor/editor-floating-panels';

import AuditPanel from './components/audit-panel';
import { AUDIT_PANEL_ID } from './constants';

export const auditPanel = createFloatingPanel( {
	id: AUDIT_PANEL_ID,
	title: 'Audit',
	icon: () => null,
	component: AuditPanel,
	isDraggable: true,
	isResizable: true,
	defaults: {
		width: 360,
		height: 600,
		minWidth: 280,
		minHeight: 400,
	},
} );
