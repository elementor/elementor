import { __ } from '@wordpress/i18n';
import { ActionProps } from '@elementor/top-bar';
import { FileReportIcon } from '@elementor/icons';
import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

export default function useDocumentSaveDraftProps(): ActionProps {
	const document = useActiveDocument();
	const { saveDraft } = useActiveDocumentActions();

	return {
		icon: FileReportIcon,
		title: __( 'Save Draft', 'elementor' ),
		onClick: saveDraft,
		disabled: ! document || document.isSaving || document.isSavingDraft || ! document.isDirty,
	};
}
