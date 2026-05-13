import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export default function useDocumentViewAsMarkdownProps() {
	const document = useActiveDocument();

	return {
		icon: EyeIcon,
		title: __( 'View as Markdown', 'elementor' ),
		onClick: async () => {
			const baseUrl = document?.links?.wpPreview || document?.links?.permalink;

			if ( ! baseUrl ) {
				return;
			}

			if ( document?.isDirty ) {
				await runCommand( 'document/save/auto', { force: true } );
			}

			const separator = baseUrl.includes( '?' ) ? '&' : '?';
			const url = baseUrl + separator + 'format=markdown';

			window.open( url, '_blank' );
		},
	};
}
