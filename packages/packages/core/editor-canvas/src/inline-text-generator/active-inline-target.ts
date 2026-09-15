import { type InlineEditorToolbarActionContext, type InlineEditorToolbarSource } from '@elementor/editor-controls';

export type ActiveInlineTarget = {
	elementId: string;
	bind: string;
	html: string;
	source: InlineEditorToolbarSource;
};

let activeInlineTarget: ActiveInlineTarget | null = null;

export const setActiveInlineTarget = ( target: ActiveInlineTarget ) => {
	activeInlineTarget = target;
};

export const getActiveInlineTarget = (): ActiveInlineTarget | null => activeInlineTarget;

export const snapshotActiveInlineTarget = ( context: InlineEditorToolbarActionContext ) => {
	setActiveInlineTarget( {
		elementId: context.elementId,
		bind: context.bind,
		html: context.editor.getHTML(),
		source: context.source,
	} );
};
