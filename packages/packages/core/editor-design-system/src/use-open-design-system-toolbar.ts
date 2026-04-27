import { useCallback } from 'react';
import { ColorSwatchIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '@elementor/editor-app-bar';

import { setInitialDesignSystemTab } from './initial-tab';
import { usePanelActions, usePanelStatus } from './design-system-panel';

/**
 * App bar "Design system" (toolbar): toggles the panel open/closed. First open defaults to the Variables tab.
 */
export function useOpenDesignSystemToolbar(): ActionProps {
	const { isOpen } = usePanelStatus();
	const { open, close } = usePanelActions();

	const onClick = useCallback( () => {
		if ( isOpen ) {
			void close();
		} else {
			setInitialDesignSystemTab( 'variables' );
			void open();
		}
	}, [ isOpen, open, close ] );

	return {
		title: __( 'Design system', 'elementor' ),
		icon: ColorSwatchIcon,
		onClick,
	};
}
