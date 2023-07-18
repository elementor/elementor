import { __ } from '@wordpress/i18n';
import { EyeIcon } from '@elementor/icons';
import { runCommand } from '@elementor/v1-adapters';
import { useActiveDocument } from '@elementor/documents';

export default function useDocumentPreviewProps() {
	const document = useActiveDocument();

	return {
		icon: EyeIcon,
		title: __( 'Preview Changes', 'elementor' ),
		onClick: () => document && runCommand( 'editor/documents/preview', {
			id: document.id,
			force: true,
		} ),
	};
}
