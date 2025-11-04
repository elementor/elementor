import * as React from 'react';
import { type ForwardedRef, useEffect } from 'react';
import type { DOMOutputSpec } from 'prosemirror-model';
import { Box, type SxProps, type Theme } from '@elementor/ui';
import Paragraph from '@tiptap/extension-paragraph';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	displayToolbar?: boolean;
	getContainer?: () => HTMLDivElement | null;
	attributes?: React.HTMLAttributes< HTMLDivElement >;
	sx?: SxProps< Theme >;
};

const SpanParagraph = Paragraph.extend( {
	name: 'paragraph',

	parseHTML() {
		return [
			{ tag: 'span[data-block-paragraph]' },
			{
				tag: 'span',
				getAttrs: ( el: any ) => ( ( el as HTMLElement ).style?.display === 'block' ? {} : false ),
			},
			{ tag: 'p' },
		];
	},

	renderHTML( { HTMLAttributes }: { HTMLAttributes: Record< string, unknown > } ): DOMOutputSpec {
		const existingStyle = typeof HTMLAttributes.style === 'string' ? HTMLAttributes.style : '';
		const style = [ existingStyle, 'display:block', 'margin:0' ].filter( Boolean ).join( ';' );
		return [ 'span', { ...HTMLAttributes, style, 'data-block-paragraph': '' }, 0 ];
	},
} );

export const InlineEditor = React.forwardRef(
	( { value, setValue, attributes = {}, sx }: InlineEditorProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const editor = useEditor( {
			extensions: [ StarterKit.configure( { paragraph: false } ), SpanParagraph ],
			content: value || '',
			onUpdate: ( { editor: ed } ) => {
				setValue( ed.getHTML() );
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
			<Box
				ref={ ref }
				sx={ {
					p: 0.8,
					border: '1px solid',
					borderColor: 'grey.200',
					borderRadius: '8px',
					transition: 'border-color .2s ease, box-shadow .2s ease',
					'&:hover': { borderColor: 'black' },
					'&:focus-within': { borderColor: 'black', boxShadow: '0 0 0 1px black' },
					'& .ProseMirror:focus': { outline: 'none' },
					'& .ProseMirror': { minHeight: '70px', fontSize: '12px' },
					...sx,
				} }
				{ ...attributes }
			>
				<EditorContent editor={ editor as Editor | null } />
			</Box>
		);
	}
);
