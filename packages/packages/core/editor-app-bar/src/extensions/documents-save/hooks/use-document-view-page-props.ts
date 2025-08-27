import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export default function useDocumentViewPageProps() {
	const document = useActiveDocument();

	return {
		icon: EyeIcon,
		title: __( 'View Page', 'elementor' ),
		onClick: () =>
			document?.id &&
			runCommand( 'editor/documents/view', {
				id: document.id,
			} ),
	};
}
