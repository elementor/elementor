import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { SearchIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	return {
		title: __( 'Finder', 'elementor' ),
		icon: SearchIcon,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.finder, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.finder,
					trigger: config.triggers.toggleClick,
					element: config.elements.buttonIcon,
				} );
			}

			runCommand( 'finder/toggle' );
		},
	} satisfies ActionProps;
}
