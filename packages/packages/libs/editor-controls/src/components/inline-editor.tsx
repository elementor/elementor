import * as React from 'react';
import { type ForwardedRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const InlineEditor = React.forwardRef(
	(
		{
			value,
			setValue,
			attributes = {},
		}: {
			value: unknown;
			setValue: ( value: unknown ) => void;
			displayToolbar?: boolean;
			getContainer?: () => HTMLDivElement | null;
			attributes?: Record< string, string >;
		},
		ref: ForwardedRef< HTMLDivElement >
	) => {
		const editor = useEditor( {
			extensions: [ StarterKit ],
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
