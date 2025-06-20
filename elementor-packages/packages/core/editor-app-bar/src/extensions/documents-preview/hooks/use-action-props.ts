import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function useActionProps() {
	const document = useActiveDocument();

	return {
		icon: EyeIcon,
		title: __( 'Preview Changes', 'elementor' ),
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementor?.editorEvents?.config;

			if ( config ) {
				extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.previewPage, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations[ 'preview-page' ],
					trigger: config.triggers.click,
					element: config.elements.buttonIcon,
				} );
			}

			if ( document ) {
				runCommand( 'editor/documents/preview', {
					id: document.id,
					force: true,
				} );
			}
		},
	};
}
