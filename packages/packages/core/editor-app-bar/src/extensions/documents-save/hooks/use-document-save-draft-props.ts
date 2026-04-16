import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useMixpanel } from '@elementor/events';
import { FileReportIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '../../../types';

export default function useDocumentSaveDraftProps(): ActionProps {
	const document = useActiveDocument();
	const { saveDraft } = useActiveDocumentActions();
	const { dispatchEvent, config } = useMixpanel();

	return {
		icon: FileReportIcon,
		title: __( 'Save Draft', 'elementor' ),
		onClick: () => {
			const eventName = config?.names?.editorOne?.topBarPublishDropdown;
			if ( eventName ) {
				dispatchEvent?.( eventName, {
					app_type: config?.appTypes?.editor,
					window_name: config?.appTypes?.editor,
					interaction_type: config?.triggers?.click?.toLowerCase(),
					target_type: config?.targetTypes?.dropdownItem,
					target_name: config?.targetNames?.publishDropdown?.saveDraft,
					interaction_result: config?.interactionResults?.actionSelected,
					target_location: config?.locations?.topBar?.replace( /\s+/g, '_' ).toLowerCase(),
					location_l1: config?.secondaryLocations?.publishDropdown?.replace( /\s+/g, '_' ).toLowerCase(),
					location_l2: config?.targetTypes?.dropdownItem,
				} );
			}
			saveDraft();
		},
		disabled: ! document || document.isSaving || document.isSavingDraft || ! document.isDirty,
	};
}
