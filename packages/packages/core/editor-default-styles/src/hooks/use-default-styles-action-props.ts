import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { TextIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelActions, usePanelStatus } from '../default-styles-panel';

export function useDefaultStylesActionProps(): ToggleActionProps {
	const { isOpen, isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	return {
		title: __( 'Default Styles', 'elementor' ),
		icon: TextIcon,
		onClick: () => {
			if ( isOpen ) {
				void close();
			} else {
				void open();
			}
		},
		selected: isOpen,
		disabled: isBlocked,
	};
}
