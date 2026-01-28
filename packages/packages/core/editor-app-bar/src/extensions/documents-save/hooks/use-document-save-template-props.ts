import { __useActiveDocumentActions as useActiveDocumentActions } from '@elementor/editor-documents';
import { FolderIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '../../../types';
import { trackPublishDropdownAction } from '../../../utils/tracking';

export default function useDocumentSaveTemplateProps(): ActionProps {
	const { saveTemplate } = useActiveDocumentActions();

	return {
		icon: FolderIcon,
		title: __( 'Save as Template', 'elementor' ),
		onClick: () => {
			trackPublishDropdownAction( 'save_as_template' );
			saveTemplate();
		},
	};
}
