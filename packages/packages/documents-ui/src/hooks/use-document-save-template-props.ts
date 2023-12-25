import { __ } from '@wordpress/i18n';
import { ActionProps } from '@elementor/top-bar';
import { FolderIcon } from '@elementor/icons';
import { useActiveDocumentActions } from '@elementor/documents';

export default function useDocumentSaveTemplateProps(): ActionProps {
	const { saveTemplate } = useActiveDocumentActions();

	return {
		icon: FolderIcon,
		title: __( 'Save as Template', 'elementor' ),
		onClick: saveTemplate,
	};
}
