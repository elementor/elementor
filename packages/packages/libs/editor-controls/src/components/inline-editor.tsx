import * as React from 'react';
import { type DependencyList, type ForwardedRef, useEffect, useRef } from 'react';
import { type SxProps, type Theme } from '@elementor/ui';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { EditorContent, type EditorEvents, useEditor } from '@tiptap/react';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	attributes?: Record< string, string >;
	sx?: SxProps< Theme >;
	onBlur?: ( event: FocusEvent ) => void;
};

const useOnUpdate = ( callback: () => void, dependencies: DependencyList ): void => {
	const hasMounted = useRef( false );

	useEffect( () => {
		if ( hasMounted.current ) {
			callback();
		} else {
			hasMounted.current = true;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies );
};

const extensions = [
	Document.extend( {
		content: 'block+',
	} ),
	Paragraph.extend( {
		renderHTML( { HTMLAttributes } ) {
			return [ 'p', { ...HTMLAttributes, style: 'margin:0;padding:0;' }, 0 ];
		},
	} ),
	Heading.extend( {
		renderHTML( { node, HTMLAttributes } ) {
			const level = this.options.levels.includes( node.attrs.level )
				? node.attrs.level
				: this.options.levels[ 0 ];
			return [ `h${ level }`, { ...HTMLAttributes, style: 'margin:0;padding:0;' }, 0 ];
		},
	} ).configure( {
		levels: [ 1, 2, 3, 4, 5, 6 ],
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
];

export const InlineEditor = React.forwardRef(
	( { value, setValue, attributes = {}, ...props }: InlineEditorProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const onBlur = ( { editor: updatedEditor, event }: EditorEvents[ 'blur' ] ) => {
			if ( updatedEditor.view.dom.contains( event.target as Node ) ) {
				return;
			}

			props.onBlur?.( event );
		};

		const editor = useEditor( {
			extensions,
			content: value,
			onUpdate: ( { editor: updatedEditor } ) => setValue( updatedEditor.getHTML() ),
			editorProps: { attributes },
			onBlur,
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

		return <EditorContent ref={ ref } editor={ editor } />;
	}
);
