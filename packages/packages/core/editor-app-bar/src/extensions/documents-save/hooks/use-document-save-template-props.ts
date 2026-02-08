import { __useActiveDocumentActions as useActiveDocumentActions } from '@elementor/editor-documents';
import { FolderIcon } from '@elementor/icons';
import { useMixpanel } from '@elementor/events';
import { __ } from '@wordpress/i18n';

import { type ActionProps } from '../../../types';

export default function useDocumentSaveTemplateProps(): ActionProps {
	const { saveTemplate } = useActiveDocumentActions();
	const { dispatchEvent, config } = useMixpanel();

	return {
		icon: FolderIcon,
		title: __( 'Save as Template', 'elementor' ),
		onClick: () => {
			const eventName = config?.names?.editorOne?.topBarPublishDropdown;
			if ( eventName ) {
				dispatchEvent?.( eventName, {
					app_type: config?.appTypes?.editor,
					window_name: config?.appTypes?.editor,
					interaction_type: config?.triggers?.click,
					target_type: config?.targetTypes?.dropdownItem,
					target_name: config?.targetNames?.publishDropdown?.saveAsTemplate,
					interaction_result: config?.interactionResults?.actionSelected,
					target_location: config?.locations?.topBar,
					location_l1: config?.secondaryLocations?.publishDropdown,
				} );
			}
			saveTemplate();
		},
	};
}
