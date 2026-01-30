import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { LinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps, type ExtendedWindow } from '../../../types';
import { trackPublishDropdownAction } from '../../../utils/tracking';

export default function useDocumentCopyAndShareProps(): ActionProps {
	const document = useActiveDocument();
	const { copyAndShare } = useActiveDocumentActions();
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	return {
		icon: LinkIcon,
		title: __( 'Copy and Share', 'elementor' ),
		onClick: () => {
			trackPublishDropdownAction( config?.targetNames?.publishDropdown?.copyAndShare ?? 'copy_and_share' );
			copyAndShare();
		},
		disabled:
			! document || document.isSaving || document.isSavingDraft || ! ( 'publish' === document.status.value ),
		visible: document?.permissions?.showCopyAndShare,
	};
}
