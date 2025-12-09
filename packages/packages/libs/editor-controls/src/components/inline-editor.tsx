import * as React from 'react';
import { type DependencyList, type ForwardedRef, useEffect, useRef } from 'react';
import { ClickAwayListener, type SxProps, type Theme } from '@elementor/ui';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import { type AnyExtension, EditorContent, useEditor } from '@tiptap/react';

import { InlineEditorToolbar } from './inline-editor-toolbar';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	attributes?: Record< string, string >;
	sx?: SxProps< Theme >;
	onBlur?: ( event: FocusEvent ) => void;
	showToolbar?: boolean;
	autofocus?: boolean;
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
	Link.configure( {
		openOnClick: false,
	} ),
	Text,
	Bold,
	Italic,
	Strike,
	Superscript,
	Subscript,
	Underline,
	HardBreak.extend( {
		addKeyboardShortcuts() {
			return {
				Enter: () => this.editor.commands.setHardBreak(),
			};
		},
	} ),
] as AnyExtension[];

export const InlineEditor = React.forwardRef(
	(
		{ value, setValue, attributes = {}, showToolbar = false, autofocus = false, ...props }: InlineEditorProps,
		ref: ForwardedRef< HTMLDivElement >
	) => {
		const onBlur = ( event: PointerEvent ) => {
			if ( ! props.onBlur || editor.view.dom.contains( event.target as Node ) ) {
				return;
			}

			props.onBlur( event );
		};

		const editor = useEditor( {
			extensions,
			content: value,
			onUpdate: ( { editor: updatedEditor } ) => setValue( updatedEditor.getHTML() ),
			editorProps: {
				attributes,
			},
			autofocus,
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
			<>
				{ showToolbar && <InlineEditorToolbar editor={ editor } /> }
				<ClickAwayListener onClickAway={ onBlur }>
					<EditorContent ref={ ref } editor={ editor } />
				</ClickAwayListener>
			</>
		);
	}
);
