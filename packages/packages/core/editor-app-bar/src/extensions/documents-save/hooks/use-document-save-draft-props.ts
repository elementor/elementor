import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { FileReportIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';
import { trackPublishDropdownAction } from '../../../utils/tracking';

export default function useDocumentSaveDraftProps(): ActionProps {
	const document = useActiveDocument();
	const { saveDraft } = useActiveDocumentActions();
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	return {
		icon: FileReportIcon,
		title: __( 'Save Draft', 'elementor' ),
		onClick: () => {
			trackPublishDropdownAction( config?.targetNames?.publishDropdown?.saveDraft ?? 'save_draft' );
			saveDraft();
		},
		disabled: ! document || document.isSaving || document.isSavingDraft || ! document.isDirty,
	};
}
