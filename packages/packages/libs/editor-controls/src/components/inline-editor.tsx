import * as React from 'react';
import {
	type DependencyList,
	type Dispatch,
	type PropsWithChildren,
	type RefObject,
	type SetStateAction,
	useEffect,
	useRef,
} from 'react';
import { Box, ClickAwayListener, type SxProps, type Theme } from '@elementor/ui';
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
import { type EditorProps, type EditorView } from '@tiptap/pm/view';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';

import { isEmpty } from '../utils/inline-editing';

const ITALIC_KEYBOARD_SHORTCUT = 'i';
const BOLD_KEYBOARD_SHORTCUT = 'b';
const UNDERLINE_KEYBOARD_SHORTCUT = 'u';

type InlineEditorProps = {
	value: string | null;
	setValue: ( value: string | null ) => void;
	editorProps?: EditorProps;
	elementClasses?: string;
	sx?: SxProps< Theme >;
	onBlur?: () => void;
	autofocus?: boolean;
	expectedTag?: string | null;
	onEditorCreate?: Dispatch< SetStateAction< Editor | null > >;
	wrapperClassName?: string;
	onSelectionEnd?: ( view: EditorView ) => void;
};

type WrapperProps = PropsWithChildren< {
	containerRef: RefObject< HTMLDivElement >;
	editor: ReturnType< typeof useEditor >;
	sx: SxProps< Theme >;
	onBlur?: () => void;
	className?: string;
} >;

export const InlineEditor = React.forwardRef( ( props: InlineEditorProps, ref ) => {
	const {
		value,
		setValue,
		editorProps = {},
		elementClasses = '',
		autofocus = false,
		sx = {},
		onBlur = undefined,
		expectedTag = null,
		onEditorCreate,
		wrapperClassName,
		onSelectionEnd,
	} = props;

	const containerRef = useRef< HTMLDivElement >( null );
	const documentContentSettings = !! expectedTag ? 'block+' : 'inline*';

	const onUpdate = ( { editor: updatedEditor }: { editor: Editor } ) => {
		const newValue: string | null = updatedEditor.getHTML();
		console.log( '[DEBUG-NAV] 1. onUpdate fired, HTML:', newValue );

		setValue( isEmpty( newValue ) ? null : newValue );
	};

	const onKeyDown = ( _: Editor[ 'view' ], event: KeyboardEvent ) => {
		if ( event.key === 'Escape' ) {
			onBlur?.();
		}

		if ( ( ! event.metaKey && ! event.ctrlKey ) || event.altKey ) {
			return;
		}

		if ( [ ITALIC_KEYBOARD_SHORTCUT, BOLD_KEYBOARD_SHORTCUT, UNDERLINE_KEYBOARD_SHORTCUT ].includes( event.key ) ) {
			event.stopPropagation();
		}
	};

	const editedElementAttributes = ( HTMLAttributes: Record< string, unknown > ) => ( {
		...HTMLAttributes,
		class: elementClasses,
	} );

	const editor = useEditor( {
		extensions: [
			Document.extend( {
				content: documentContentSettings,
			} ),
			Paragraph.extend( {
				renderHTML( { HTMLAttributes } ) {
					const tag = expectedTag ?? 'p';
					return [ tag, editedElementAttributes( HTMLAttributes ), 0 ];
				},
			} ),
			Heading.extend( {
				renderHTML( { node, HTMLAttributes } ) {
					if ( expectedTag ) {
						return [ expectedTag, editedElementAttributes( HTMLAttributes ), 0 ];
					}

					const level = this.options.levels.includes( node.attrs.level )
						? node.attrs.level
						: this.options.levels[ 0 ];

					return [ `h${ level }`, editedElementAttributes( HTMLAttributes ), 0 ];
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
		],
		content: value,
		onUpdate,
		autofocus,
		editorProps: {
			...editorProps,
			handleDOMEvents: {
				keydown: onKeyDown,
			},
			attributes: {
				...( editorProps.attributes ?? {} ),
				role: 'textbox',
			},
		},
		onCreate: onEditorCreate ? ( { editor: mountedEditor } ) => onEditorCreate( mountedEditor ) : undefined,
		onSelectionUpdate: onSelectionEnd
			? ( { editor: updatedEditor } ) => onSelectionEnd( updatedEditor.view )
			: undefined,
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
			<Wrapper
				containerRef={ containerRef }
				editor={ editor }
				sx={ sx }
				onBlur={ onBlur }
				className={ wrapperClassName }
			>
				<EditorContent ref={ ref } editor={ editor } />
			</Wrapper>
		</>
	);
} );

const Wrapper = ( { children, containerRef, editor, sx, onBlur, className }: WrapperProps ) => {
	const wrappedChildren = (
		<Box ref={ containerRef } { ...sx } className={ className }>
			{ children }
		</Box>
	);

	return onBlur ? (
		<ClickAwayListener
			onClickAway={ ( event: PointerEvent ) => {
				if (
					containerRef.current?.contains( event.target as Node ) ||
					editor.view.dom.contains( event.target as Node )
				) {
					return;
				}

				onBlur?.();
			} }
		>
			{ wrappedChildren }
		</ClickAwayListener>
	) : (
		<>{ wrappedChildren }</>
	);
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
