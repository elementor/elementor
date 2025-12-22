import * as React from 'react';
import { type DependencyList, useEffect, useRef } from 'react';
import { bindPopover, Box, ClickAwayListener, Popover, type SxProps, type Theme, usePopupState } from '@elementor/ui';
import { generateUniqueId } from '@elementor/utils';
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
import { type EditorView } from '@tiptap/pm/view';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';

import { isEmpty } from '../utils/inline-editing';
import { InlineEditorToolbar } from './inline-editor-toolbar';

const EXTERNAL_CHANGE_EVENT_NAME = 'elementor/editor/external-inline-editor-change';

type ExternalEventDetails = {
	newValue: string;
	uniqueId: string;
};

type InlineEditorProps = {
	value: string | null;
	setValue: ( value: string | null ) => void;
	attributes?: Record< string, string >;
	sx?: SxProps< Theme >;
	onBlur?: ( event: Event ) => void;
	showToolbar?: boolean;
	autofocus?: boolean;
	getInitialPopoverPosition?: () => { left: number; top: number };
	expectedTag?: string | null;
	listenToExternalChanges?: boolean;
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

export const InlineEditor = React.forwardRef(
	(
		{
			value,
			setValue,
			attributes = {},
			showToolbar = false,
			autofocus = false,
			sx = {},
			onBlur = undefined,
			getInitialPopoverPosition = undefined,
			expectedTag = null,
			listenToExternalChanges = true,
		}: InlineEditorProps,
		ref
	) => {
		const containerRef = React.useRef< HTMLDivElement >( null );
		const popupState = usePopupState( { variant: 'popover', disableAutoFocus: true } );
		const [ hasSelectedContent, setHasSelectedContent ] = React.useState( false );
		const documentContentSettings = !! expectedTag ? 'block+' : 'inline*';
		const uniqueId = React.useRef( generateUniqueId() );

		const onSelectionEnd = ( view: EditorView ) => {
			setHasSelectedContent( () => ! view.state.selection.empty );
			queueMicrotask( () => view.focus() );
		};

		const onKeyDown = ( _: EditorView, event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onBlur?.( event );
			}
		};

		const toolbarRelatedListeners = showToolbar
			? {
					mouseup: onSelectionEnd,
					keyup: onSelectionEnd,
					keydown: onKeyDown,
			  }
			: undefined;

		const onUpdate = ( { editor: updatedEditor }: { editor: Editor } ) => {
			const newValue: string | null = updatedEditor.getHTML();

			setValue( isEmpty( newValue ) ? null : newValue );
			dispatchUpdateEvent( newValue ?? '' );
		};

		const editor = useEditor( {
			extensions: [
				Document.extend( {
					content: documentContentSettings,
				} ),
				Paragraph.extend( {
					renderHTML( { HTMLAttributes } ) {
						const tag = expectedTag ?? 'p';
						return [ tag, { ...HTMLAttributes, style: 'margin:0;padding:0;' }, 0 ];
					},
				} ),
				Heading.extend( {
					renderHTML( { node, HTMLAttributes } ) {
						if ( expectedTag ) {
							return [ expectedTag, { ...HTMLAttributes, style: 'margin:0;padding:0;' }, 0 ];
						}

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
			],
			content: value,
			onUpdate,
			autofocus,
			editorProps: {
				attributes: {
					...attributes,
					class: attributes.class ?? '',
					role: 'textbox',
				},
				handleDOMEvents: toolbarRelatedListeners,
			},
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

		useEffect( () => {
			if ( ! listenToExternalChanges ) {
				return;
			}

			window?.addEventListener( EXTERNAL_CHANGE_EVENT_NAME, updateEditorValue );

			return () => {
				window?.removeEventListener( EXTERNAL_CHANGE_EVENT_NAME, updateEditorValue as EventListener );
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		const updateEditorValue = ( ( ev: CustomEvent< ExternalEventDetails > ) => {
			const { newValue, uniqueId: triggeringUniqueId } = ev.detail;

			if ( triggeringUniqueId === uniqueId.current ) {
				return;
			}

			editor?.commands.setContent( newValue, { emitUpdate: false } );
		} ) as EventListener;

		const dispatchUpdateEvent = ( newValue: string ) => {
			const event = new CustomEvent< ExternalEventDetails >( EXTERNAL_CHANGE_EVENT_NAME, {
				detail: {
					newValue,
					uniqueId: uniqueId.current,
				},
			} );

			window.dispatchEvent( event );
		};

		const computePopupPosition = () => {
			const positionFallback = { left: 0, top: 0 };
			const { left, top } = containerRef.current?.getBoundingClientRect() ?? positionFallback;
			const initial = getInitialPopoverPosition?.() ?? positionFallback;

			return {
				left: left + initial.left,
				top: top + initial.top,
			};
		};

		const Wrapper = ( { children }: React.PropsWithChildren ) => {
			const wrappedChildren = (
				<Box ref={ containerRef } { ...sx }>
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

						onBlur?.( event );
					} }
				>
					{ wrappedChildren }
				</ClickAwayListener>
			) : (
				<>{ wrappedChildren }</>
			);
		};

		return (
			<>
				<Wrapper>
					<EditorContent ref={ ref } editor={ editor } />
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
						open={ hasSelectedContent }
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
