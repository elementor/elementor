import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { HistoryIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	const { isActive, isBlocked } = useRouteStatus( 'panel/history' );

	return {
		title: __( 'History', 'elementor' ),
		icon: HistoryIcon,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementorCommon?.eventsManager?.config;

			if ( config ) {
				extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.history, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.elementorLogo,
					trigger: config.triggers.click,
					element: config.elements.link,
				} );
			}

			openRoute( 'panel/history/actions' );
		},
		selected: isActive,
		disabled: isBlocked,
	};
}
