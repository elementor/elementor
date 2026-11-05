import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { __ } from '@wordpress/i18n';

import AngieToggleIcon from '../components/angie-toggle-icon';
import { angiePanel } from '../editor-panel';

export function useAngieToggleProps(): ToggleActionProps {
	const { isOpen } = angiePanel.useFloatingPanelStatus();
	const { toggle } = angiePanel.useFloatingPanelActions();

	return {
		title: __( 'Angie', 'elementor' ),
		icon: AngieToggleIcon,
		selected: isOpen,
		onClick: () => toggle(),
	};
}
