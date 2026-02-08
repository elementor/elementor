import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { useMixpanel } from '@elementor/events';
import { EyeIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export default function useDocumentViewPageProps() {
	const document = useActiveDocument();
	const { dispatchEvent, config } = useMixpanel();

	return {
		icon: EyeIcon,
		title: __( 'View Page', 'elementor' ),
		onClick: () => {
			const eventName = config?.names?.editorOne?.topBarPublishDropdown;
			if ( eventName ) {
				dispatchEvent?.( eventName, {
					app_type: config?.appTypes?.editor,
					window_name: config?.appTypes?.editor,
					interaction_type: config?.triggers?.click,
					target_type: config?.targetTypes?.dropdownItem,
					target_name: config?.targetNames?.publishDropdown?.viewPage,
					interaction_result: config?.interactionResults?.actionSelected,
					target_location: config?.locations?.topBar,
					location_l1: config?.secondaryLocations?.publishDropdown,
				} );
			}
			if ( document?.id ) {
				runCommand( 'editor/documents/view', {
					id: document.id,
				} );
			}
		},
	};
}
