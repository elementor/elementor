import * as React from 'react';
import { type ForwardedRef } from 'react';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
export const InlineEditor = React.forwardRef(
	(
		{
			value,
			setValue,
			attributes = {},
		}: {
			value: unknown;
			setValue: ( value: unknown ) => void;
			attributes?: Record< string, string >;
		},
		ref: ForwardedRef< HTMLDivElement >
	) => {
		const editor = useEditor( {
			extensions: [
				Document.extend( {
					content: 'inline*',
				} ),
				Text,
				Bold,
				Italic,
				Strike,
				HardBreak.extend( {
					addKeyboardShortcuts() {
						return {
							Enter: () => this.editor.commands.setHardBreak(),
						};
					},
				} ),
			],
			content: value as string,
			onUpdate: ( { editor: updatedEditor } ) => setValue( updatedEditor.getHTML() ),
		} );
		return (
			<div ref={ ref } { ...attributes }>
				<EditorContent editor={ editor } />
			</div>
		);
	}
);
