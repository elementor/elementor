import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { ToggleRightIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow, type ToggleActionProps } from '../../../types';

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'panel/editor-preferences' );

	return {
		icon: ToggleRightIcon,
		title: __( 'User Preferences', 'elementor' ),
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.userPreferences, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.elementorLogo,
					trigger: config.triggers.click,
					element: config.elements.link,
				} );
			}

			openRoute( 'panel/editor-preferences' );
		},
		selected: isActive,
		disabled: isBlocked,
	};
}
