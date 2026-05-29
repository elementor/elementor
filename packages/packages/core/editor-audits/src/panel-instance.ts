import { createFloatingPanel } from '@elementor/editor-floating-panels';

import AuditPanel from './components/audit-panel';

export const AUDIT_PANEL_ID = 'audit-panel';

const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 600;
const MIN_WIDTH = 280;
const MIN_HEIGHT = 400;

export const auditPanel = createFloatingPanel( {
	id: AUDIT_PANEL_ID,
	title: 'Audit',
	icon: () => null,
	component: AuditPanel,
	defaults: {
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
		minWidth: MIN_WIDTH,
		minHeight: MIN_HEIGHT,
		initialMode: 'docked',
	},
} );
