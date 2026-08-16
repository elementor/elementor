import { utilitiesMenu } from '@elementor/editor-app-bar';

import { useAuditToggleProps } from './hooks/use-audit-toggle-props';

const AUDIT_TOGGLE_PRIORITY = 24;

export function registerAppBarAuditsToggle(): void {
	utilitiesMenu.registerToggleAction( {
		id: 'toggle-audit-panel',
		priority: AUDIT_TOGGLE_PRIORITY,
		useProps: useAuditToggleProps,
	} );
}
