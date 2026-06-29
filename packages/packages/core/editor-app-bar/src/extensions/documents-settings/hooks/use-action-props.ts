import {
	__useActiveDocument as useActiveDocument,
	__useHostDocument as useHostDocument,
} from '@elementor/editor-documents';
import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { FileSettingsIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();
	const { isActive, isBlocked } = useRouteStatus( 'panel/page-settings' );

	const document = activeDocument && activeDocument.type.value !== 'kit' ? activeDocument : hostDocument;

	const ButtonTitle = document
		? /* translators: %s: Post type label. */
		  __( '%s Settings', 'elementor' ).replace( '%s', document.type.label )
		: __( 'Document Settings', 'elementor' );

	return {
		title: ButtonTitle,
		icon: FileSettingsIcon,
		onClick: () => {
			if ( ! document ) {
				return;
			}

			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementorCommon?.eventsManager?.config;

			if ( config ) {
				extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.documentSettings, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations[ 'document-settings' ],
					trigger: config.triggers.click,
					element: config.elements.buttonIcon,
				} );
			}

			openRoute( 'panel/page-settings/settings' );
		},
		selected: isActive,
		disabled: isBlocked || ! document,
	};
}
