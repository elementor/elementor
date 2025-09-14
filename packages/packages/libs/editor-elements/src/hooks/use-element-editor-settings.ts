import { __privateUseListenTo as useListenTo, windowEvent } from '@elementor/editor-v1-adapters';

import { getElementEditorSettings } from '../sync/get-element-editor-settings';
import { type ElementID } from '../types';

export const useElementEditorSettings = ( elementId: ElementID ) => {
	return useListenTo(
		windowEvent( 'elementor/element/update_editor_settings' ),
		() => getElementEditorSettings( elementId ),
		[ elementId ]
	);
};
