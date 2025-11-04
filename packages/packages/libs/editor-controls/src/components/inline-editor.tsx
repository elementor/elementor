import * as React from 'react';
import { type ForwardedRef, useEffect } from 'react';
import type { DOMOutputSpec } from 'prosemirror-model';
import Paragraph from '@tiptap/extension-paragraph';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	displayToolbar?: boolean;
	getContainer?: () => HTMLDivElement | null;
	attributes?: React.HTMLAttributes< HTMLDivElement >;
};

const SpanParagraph = Paragraph.extend( {
	name: 'paragraph',
	parseHTML() {
		return [ { tag: 'p' }, { tag: 'span' } ];
	},
	renderHTML( { HTMLAttributes }: { HTMLAttributes: Record< string, unknown > } ): DOMOutputSpec {
		return [ 'p', HTMLAttributes, 0 ];
	},
} );

export const InlineEditor = React.forwardRef(
	( { value, setValue, attributes = {} }: InlineEditorProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const editor = useEditor( {
			extensions: [ StarterKit.configure( { paragraph: false } ), SpanParagraph ],
			content: value || '',
			onUpdate: ( { editor: ed } ) => {
				let html = ed.getHTML();

				html = html.replace( /<p>/g, '<span style="display:block">' ).replace( /<\/p>/g, '</span>' );

				html = html.replace(
					/<span style="display:block"><\/span>/g,
					'<span style="display:block"><br></span>'
				);

				setValue( html );
			},
		} );

		useEffect( () => {
			if ( ! editor ) {
				return;
			}
			const html = value || '';

			if ( editor.getHTML() !== html ) {
				editor.commands.setContent( html, { emitUpdate: false } );
			}
		}, [ editor, value ] );

		return (
			<div ref={ ref } { ...attributes }>
				<EditorContent editor={ editor as Editor | null } />
			</div>
		);
	}
);
