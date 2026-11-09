import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';

export const { Slot: InlineEditorToolbarActionsSlot, inject: injectIntoInlineEditorToolbar } = createLocation< {
	elementId: ElementID;
} >();
