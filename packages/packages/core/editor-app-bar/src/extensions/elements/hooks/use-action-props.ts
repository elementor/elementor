import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { PlusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'panel/elements' );

	return {
		title: __( 'Add Element', 'elementor' ),
		icon: PlusIcon,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.widgetPanel, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations[ 'widget-panel' ],
					trigger: config.triggers.toggleClick,
					element: config.elements.buttonIcon,
				} );
			}

			openRoute( 'panel/elements/categories' );
		},
		selected: isActive,
		disabled: isBlocked,
	};
}
