import { type ElementID } from '@elementor/editor-elements';
import { createLocation } from '@elementor/locations';
import { type Editor } from '@tiptap/react';

export type InlineEditorToolbarSource = 'panel' | 'canvas';

export type InlineEditorToolbarActionContext = {
	editor: Editor;
	elementId: ElementID;
	bind: string;
	html: string;
	source: InlineEditorToolbarSource;
};

export const { Slot: InlineEditorToolbarActionsSlot, inject: injectIntoInlineEditorToolbarActions } =
	createLocation< InlineEditorToolbarActionContext >();
