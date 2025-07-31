import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { PagesIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelActions, usePanelStatus } from '../components/panel/panel';
import { type ExtendedWindow } from '../types';

export function useToggleButtonProps(): ToggleActionProps {
	const { isOpen: selectedState, isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	return {
		title: __( 'Pages', 'elementor' ),
		icon: PagesIcon,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( 'top_bar_pages', {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.elementorLogo,
					trigger: config.triggers.click,
					element: config.elements.buttonIcon,
				} );
			}

			return selectedState ? close() : open();
		},
		selected: selectedState,
		disabled: isBlocked,
	};
}
