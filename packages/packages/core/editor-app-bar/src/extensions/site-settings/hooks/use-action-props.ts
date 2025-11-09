import {
	__privateRunCommand as runCommand,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { SettingsIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow, type ToggleActionProps } from '../../../types';

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'panel/global', {
		blockOnKitRoutes: false,
	} );

	return {
		title: __( 'Site Settings', 'elementor' ),
		icon: SettingsIcon,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementorCommon?.eventsManager?.config;

			if ( config ) {
				extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.siteSettings, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.siteSettings,
					trigger: config.triggers.toggleClick,
					element: config.elements.buttonIcon,
				} );
			}

			if ( isActive ) {
				runCommand( 'panel/global/close' );
			} else {
				runCommand( 'panel/global/open' );
			}
		},
		selected: isActive,
		disabled: isBlocked,
	};
}
