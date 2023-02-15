import { __ } from '@wordpress/i18n';
import { EyeIcon } from '../icons/eye-icon';
import { runCommand } from '@elementor/v1-adapters';
import useActiveDocument from '../hooks/use-active-document';

export default function useDocumentPreviewProps() {
	const document = useActiveDocument();

	return {
		icon: EyeIcon,
		title: __( 'Preview changes', 'elementor' ),
		onClick: () => document && runCommand( 'editor/documents/preview', { id: document.id } ),
	};
}
