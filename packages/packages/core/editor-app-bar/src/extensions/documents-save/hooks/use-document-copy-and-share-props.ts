import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useMixpanel } from '@elementor/events';
import { LinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '../../../types';

export default function useDocumentCopyAndShareProps(): ActionProps {
	const document = useActiveDocument();
	const { copyAndShare } = useActiveDocumentActions();
	const { dispatchEvent, config } = useMixpanel();

	return {
		icon: LinkIcon,
		title: __( 'Copy and Share', 'elementor' ),
		onClick: () => {
			const eventName = config?.names?.editorOne?.topBarPublishDropdown;
			if ( eventName ) {
				dispatchEvent?.( eventName, {
					app_type: config?.appTypes?.editor,
					window_name: config?.appTypes?.editor,
					interaction_type: config?.triggers?.click,
					target_type: config?.targetTypes?.dropdownItem,
					target_name: config?.targetNames?.publishDropdown?.copyAndShare,
					interaction_result: config?.interactionResults?.actionSelected,
					target_location: config?.locations?.topBar,
					location_l1: config?.secondaryLocations?.publishDropdown,
				} );
			}
			copyAndShare();
		},
		disabled:
			! document || document.isSaving || document.isSavingDraft || ! ( 'publish' === document.status.value ),
		visible: document?.permissions?.showCopyAndShare,
	};
}
