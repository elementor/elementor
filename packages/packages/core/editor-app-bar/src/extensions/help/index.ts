import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { utilitiesMenu } from '../../locations';
import { type ExtendedWindow } from '../../types';

export function init() {
	utilitiesMenu.registerLink( {
		id: 'open-help-center',
		priority: 25, // After Finder.
		useProps: () => {
			return {
				title: __( 'Help', 'elementor' ),
				href: 'https://go.elementor.com/editor-top-bar-learn/',
				icon: HelpIcon,
				target: '_blank',
				showExternalLinkIcon: true,
				onClick: () => {
					const extendedWindow = window as unknown as ExtendedWindow;
					const config = extendedWindow?.elementorCommon?.eventsManager?.config;

					if ( config ) {
						extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.help, {
							location: config.locations.topBar,
							secondaryLocation: config.secondaryLocations.help,
							trigger: config.triggers.click,
							element: config.elements.buttonIcon,
						} );
					}
				},
			};
		},
	} );
}
