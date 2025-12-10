import * as React from 'react';
import { type DependencyList, useEffect, useRef } from 'react';
import { bindPopover, ClickAwayListener, Popover, type SxProps, type Theme, usePopupState } from '@elementor/ui';
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
import { type AnyExtension, EditorContent, type EditorEvents, useEditor } from '@tiptap/react';

import { InlineEditorToolbar } from './inline-editor-toolbar';

type InlineEditorProps = {
	value: string;
	setValue: ( value: string ) => void;
	attributes?: Record< string, string >;
	sx?: SxProps< Theme >;
	onBlur?: ( event: FocusEvent ) => void;
	showToolbar?: boolean;
	autofocus?: boolean;
	stripStyle?: boolean;
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
		{
			value,
			setValue,
			attributes = {},
			showToolbar = false,
			autofocus = false,
			stripStyle = true,
			...props
		}: InlineEditorProps,
		ref
	) => {
		const containerRef = React.useRef< HTMLDivElement >( null );
		const selectionSize = React.useRef( 0 );
		const popupState = usePopupState( { variant: 'popover' } );

		const onBlur = props.onBlur
			? ( event: PointerEvent ) => {
					if ( editor.view.dom.contains( event.target as Node ) ) {
						return;
					}

					props?.onBlur?.( event );
			  }
			: undefined;

		const onEndSelection = ( event: KeyboardEvent | MouseEvent ) => {
			if ( ( event.type === 'keyup' && ! event.shiftKey ) || ! selectionSize.current || ! showToolbar ) {
				return;
			}

			selectionSize.current = 0;
			popupState.open( containerRef?.current );
		};

		const onSelectionStart = ( { transaction }: EditorEvents[ 'selectionUpdate' ] ) => {
			selectionSize.current = transaction.selection.content().size;

			if ( popupState.isOpen ) {
				popupState.close();
			}
		};

		const editor = useEditor( {
			extensions,
			content: value,
			onUpdate: ( { editor: updatedEditor } ) => {
				setValue( updatedEditor.getHTML() );
			},
			editorProps: {
				attributes: {
					...attributes,
					class: attributes.class + ' ' + ( stripStyle ? 'strip-styles' : '' ),
				},
			},
			onSelectionUpdate: onSelectionStart,
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

		const computePopupPosition = () => {
			if ( ! containerRef.current ) {
				return {
					left: 0,
					top: 0,
				};
			}

			const framePosition =
				document.querySelector( '#elementor-preview-iframe' )?.getBoundingClientRect() ??
				new DOMRect( 0, 0, 0, 0 );
			const containerPosition = containerRef.current.getBoundingClientRect();
			const frameScroll = {
				left: document.querySelector( '#elementor-preview' )?.scrollLeft ?? 0,
				top: document.querySelector( '#elementor-preview' )?.scrollTop ?? 0,
			};

			return {
				left: framePosition.left + containerPosition.left + frameScroll.left,
				top: framePosition.top + containerPosition.top + frameScroll.top,
			};
		};

		const Wrapper = ( { children }: React.PropsWithChildren ) => {
			const wrappedChildren = <div ref={ containerRef }>{ children }</div>;

			return onBlur ? (
				<ClickAwayListener onClickAway={ onBlur }>{ wrappedChildren }</ClickAwayListener>
			) : (
				<>{ wrappedChildren }</>
			);
		};

		return (
			<>
				<Wrapper>
					<EditorContent
						ref={ ref }
						editor={ editor }
						onMouseUp={ onEndSelection }
						onKeyUp={ onEndSelection }
					/>
				</Wrapper>
				{ showToolbar && containerRef.current && (
					<Popover
						slotProps={ {
							root: {
								sx: {
									pointerEvents: 'none',
								},
							},
						} }
						{ ...bindPopover( popupState ) }
						anchorReference="anchorPosition"
						anchorPosition={ computePopupPosition() }
						anchorOrigin={ { vertical: 'top', horizontal: 'left' } }
						transformOrigin={ { vertical: 'bottom', horizontal: 'left' } }
					>
						<InlineEditorToolbar editor={ editor } />
					</Popover>
				) }
			</>
		);
	}
);
