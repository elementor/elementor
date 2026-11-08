import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { AngieIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { angiePanel } from '../editor-panel';

export function useAngieToggleProps(): ToggleActionProps {
	const { isOpen } = angiePanel.useFloatingPanelStatus();
	const { toggle } = angiePanel.useFloatingPanelActions();

	return {
		title: __( 'Angie', 'elementor' ),
		icon: AngieIcon,
		selected: isOpen,
		onClick: () => toggle(),
	};
}
