import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { ThemeBuilderIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';

const THEME_BUILDER_V2_EXPERIMENT = 'theme_builder_v2';

export default function useActionProps(): ActionProps {
	return {
		icon: ThemeBuilderIcon,
		title: __( 'Theme Builder', 'elementor' ),
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementorCommon?.eventsManager?.config;

			if ( config ) {
				extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.themeBuilder, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.elementorLogo,
					trigger: config.triggers.click,
					element: config.elements.link,
				} );
			}

			const allFeatures = extendedWindow.elementorCommon?.config?.allExperimentalFeatures;
			const url = window.elementorAppConfig?.menu_url;
			const topWindow = window.top;

			if (
				topWindow &&
				url &&
				allFeatures &&
				THEME_BUILDER_V2_EXPERIMENT in allFeatures &&
				! allFeatures[ THEME_BUILDER_V2_EXPERIMENT ]
			) {
				topWindow.location = url;
				return;
			}

			runCommand( 'app/open' );
		},
	};
}
