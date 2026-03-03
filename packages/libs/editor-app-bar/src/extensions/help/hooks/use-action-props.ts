import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	return {
		title: __( 'Help Center', 'elementor' ),
		href: 'https://go.elementor.com/editor-top-bar-learn/',
		icon: HelpIcon,
		target: '_blank',
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
}
