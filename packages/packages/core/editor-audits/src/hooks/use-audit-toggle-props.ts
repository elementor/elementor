import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { ShieldCheckIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { auditPanel } from '../editor-panel';

export function useAuditToggleProps(): ToggleActionProps {
	const { isOpen } = auditPanel.useFloatingPanelStatus();
	const { toggle } = auditPanel.useFloatingPanelActions();

	return {
		title: __( 'Audit Page', 'elementor' ),
		icon: ShieldCheckIcon,
		selected: isOpen,
		onClick: () => toggle(),
	};
}
