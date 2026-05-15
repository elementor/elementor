import { useCallback } from 'react';
import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { DropletHalfFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelActions, usePanelStatus } from './design-system-panel';

export function useOpenDesignSystemToolbar(): ToggleActionProps {
	const { isOpen } = usePanelStatus();
	const { open, close } = usePanelActions();

	const onClick = useCallback( () => {
		if ( isOpen ) {
			void close();
		} else {
			void open();
		}
	}, [ isOpen, open, close ] );

	return {
		title: __( 'Design System', 'elementor' ),
		icon: DropletHalfFilledIcon,
		onClick,
		selected: isOpen,
	};
}
