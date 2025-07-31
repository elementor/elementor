import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { ThemeBuilderIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';

export default function useActionProps(): ActionProps {
	return {
		icon: ThemeBuilderIcon,
		title: __( 'Theme Builder', 'elementor' ),
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.themeBuilder, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.elementorLogo,
					trigger: config.triggers.click,
					element: config.elements.link,
				} );
			}

			runCommand( 'app/open' );
		},
	};
}
