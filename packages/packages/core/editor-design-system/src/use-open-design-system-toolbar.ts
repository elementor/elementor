import { useCallback } from 'react';
import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { DropletHalfFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const EVENT_TOGGLE = 'elementor/toggle-design-system';

import { usePanelStatus } from './design-system-panel';
import { getActiveDesignSystemTab } from './initial-tab';

export function useOpenDesignSystemToolbar(): ToggleActionProps {
	const { isOpen } = usePanelStatus();

	const onClick = useCallback( () => {
		const tab = getActiveDesignSystemTab() ?? 'variables';

		window.dispatchEvent(
			new CustomEvent( EVENT_TOGGLE, {
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
