import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { WordpressIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { mainMenu } from '../../locations';
import { type ExtendedWindow } from '../../types';

export function init() {
	mainMenu.registerLink( {
		id: 'exit-to-wordpress',
		group: 'exits',
		priority: 20,
		useProps: () => {
			const document = useActiveDocument();
			return {
				title: __( 'Exit to WordPress', 'elementor' ),
				href: document?.links?.platformEdit,
				icon: WordpressIcon,
				onClick: () => {
					const extendedWindow = window as unknown as ExtendedWindow;
					const config = extendedWindow?.elementorCommon?.eventsManager?.config;

					if ( config ) {
						extendedWindow.elementorCommon.eventsManager.dispatchEvent(
							config.names.topBar.exitToWordpress,
							{
								location: config.locations.topBar,
								secondaryLocation: config.secondaryLocations.elementorLogo,
								trigger: config.triggers.click,
								element: config.elements.link,
							}
						);
					}
				},
			};
		},
	} );
}
