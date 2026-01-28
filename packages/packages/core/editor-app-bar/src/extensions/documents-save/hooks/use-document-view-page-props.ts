import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';
import { trackPublishDropdownAction } from '../../../utils/tracking';

export default function useDocumentViewPageProps() {
	const document = useActiveDocument();
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	return {
		icon: EyeIcon,
		title: __( 'View Page', 'elementor' ),
		onClick: () => {
			trackPublishDropdownAction( config?.targetNames?.publishDropdown?.viewPage ?? 'view_page' );
			if ( document?.id ) {
				runCommand( 'editor/documents/view', {
					id: document.id,
				} );
			}
		},
	};
}
