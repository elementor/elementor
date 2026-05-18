import { useCallback } from 'react';
import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { DropletHalfFilledIcon } from '@elementor/icons';
import { EVENT_TOGGLE_DESIGN_SYSTEM } from './events';
import { __ } from '@wordpress/i18n';

import { usePanelStatus } from './design-system-panel';
import { getActiveDesignSystemTab } from './initial-tab';

export function useOpenDesignSystemToolbar(): ToggleActionProps {
	const { isOpen } = usePanelStatus();

	const onClick = useCallback( () => {
		const tab = getActiveDesignSystemTab() ?? 'variables';

		window.dispatchEvent(
			new CustomEvent( EVENT_TOGGLE_DESIGN_SYSTEM, {
				detail: { tab },
			} )
		);
	}, [] );

	return {
		title: __( 'Design System', 'elementor' ),
		icon: DropletHalfFilledIcon,
		onClick,
		selected: isOpen,
	};
}
