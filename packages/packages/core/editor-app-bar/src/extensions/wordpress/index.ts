import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { WordpressIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { mainMenu } from '../../locations';
import { type ExtendedWindow } from '../../types';

export function init() {
	mainMenu.registerLink( {
		id: 'exit-to-wordpress',
		group: 'exits',
		useProps: () => {
			const document = useActiveDocument();
			return {
				title: __( 'Exit to WordPress', 'elementor' ),
				href: document?.links?.platformEdit,
				icon: WordpressIcon,
				onClick: () => {
					const extendedWindow = window as unknown as ExtendedWindow;
					const config = extendedWindow?.elementor?.editorEvents?.config;

					if ( config ) {
						extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.exitToWordpress, {
							location: config.locations.topBar,
							secondaryLocation: config.secondaryLocations.elementorLogo,
							trigger: config.triggers.click,
							element: config.elements.link,
						} );
					}
				},
			};
		},
	} );
}
