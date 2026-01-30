import { __useActiveDocumentActions as useActiveDocumentActions } from '@elementor/editor-documents';
import { FolderIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';
import { trackPublishDropdownAction } from '../../../utils/tracking';

export default function useDocumentSaveTemplateProps(): ActionProps {
	const { saveTemplate } = useActiveDocumentActions();
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	return {
		icon: FolderIcon,
		title: __( 'Save as Template', 'elementor' ),
		onClick: () => {
			trackPublishDropdownAction( config?.targetNames?.publishDropdown?.saveAsTemplate ?? 'save_as_template' );
			saveTemplate();
		},
	};
}
