import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { getContainer } from '../sync/get-container';
import { type ElementID } from '../types';

export const useElementEditorSettings = ( elementId: ElementID ) => {
	return useListenTo(
		windowEvent( 'elementor/element/update_editor_settings' ),
		() => getElementEditorSettings( elementId ),
		[ elementId ]
	);
};

function getElementEditorSettings( elementId: ElementID ) {
	const container = getContainer( elementId );

	return container?.model.get( 'editor_settings' ) ?? {};
}
