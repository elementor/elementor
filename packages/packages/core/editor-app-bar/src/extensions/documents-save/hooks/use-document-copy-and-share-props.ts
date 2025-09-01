import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { LinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '../../../types';

export default function useDocumentCopyAndShareProps(): ActionProps {
	const document = useActiveDocument();
	const { copyAndShare } = useActiveDocumentActions();

	return {
		icon: LinkIcon,
		title: __( 'Copy and Share', 'elementor' ),
		onClick: copyAndShare,
		disabled:
			! document || document.isSaving || document.isSavingDraft || ! ( 'publish' === document.status.value ),
		visible: document?.permissions?.showCopyAndShare,
	};
}
