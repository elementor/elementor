import { ComponentsIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelActions, usePanelStatus } from '../components/components-panel/panel';

export function useTogglePanelProps() {
	const { isOpen, isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	return {
		title: __( 'Components', 'elementor' ),
		icon: ComponentsIcon,
		onClick: () => ( isOpen ? close() : open() ),
		selected: isOpen,
		disabled: isBlocked,
	};
}
