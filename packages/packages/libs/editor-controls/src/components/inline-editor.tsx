import * as React from 'react';
import { type DependencyList, type ForwardedRef, useEffect, useRef } from 'react';
import { Box, type SxProps, type Theme } from '@elementor/ui';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	attributes?: Record< string, string >;
	sx?: SxProps< Theme >;
};

const useOnUpdate = ( callback: () => void, dependencies: DependencyList ): void => {
	const hasMounted = useRef( false );

	useEffect( () => {
		if ( hasMounted.current ) {
			callback();
		} else {
			hasMounted.current = true;
		}
		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies );
};

export const InlineEditor = React.forwardRef(
	( { value, setValue, attributes = {}, sx }: InlineEditorProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const editor = useEditor( {
			extensions: [
				Document.extend( {
					content: 'inline*',
				} ),
				Text,
				Bold,
				Italic,
				Strike,
				Underline,
				HardBreak.extend( {
					addKeyboardShortcuts() {
						return {
							Enter: () => this.editor.commands.setHardBreak(),
						};
					},
				} ),
			],
			content: value,
			onUpdate: ( { editor: updatedEditor } ) => setValue( updatedEditor.getHTML() ),
		} );

		useOnUpdate( () => {
			if ( ! editor ) {
				return;
			}

			const currentContent = editor.getHTML();

			if ( currentContent !== value ) {
				editor.commands.setContent( value, { emitUpdate: false } );
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
					'&:hover': {
						borderColor: 'black',
					},
					'&:focus-within': {
						borderColor: 'black',
						boxShadow: '0 0 0 1px black',
					},
					'& .ProseMirror:focus': {
						outline: 'none',
					},
					'& .ProseMirror': {
						minHeight: '70px',
						fontSize: '12px',
					},
					...sx,
				} }
				{ ...attributes }
			>
				<EditorContent editor={ editor } />
			</Box>
		);
	}
);
