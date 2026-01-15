import * as React from 'react';
import { useEffect, useState } from 'react';
import { InlineEditor, InlineEditorToolbar, type InlineEditorToolbarProps } from '@elementor/editor-controls';
import { Box, ThemeProvider } from '@elementor/ui';
import { FloatingPortal, useInteractions } from '@floating-ui/react';

import { CANVAS_WRAPPER_ID, OutlineOverlay } from '../../../components/outline-overlay';
import { useBindReactPropsToElement } from '../../../hooks/use-bind-react-props-to-element';
import { useFloatingOnElement } from '../../../hooks/use-floating-on-element';

const ITALIC_KEYBOARD_SHORTCUT = 'i';
const BOLD_KEYBOARD_SHORTCUT = 'b';
const UNDERLINE_KEYBOARD_SHORTCUT = 'u';

type Editor = InlineEditorToolbarProps[ 'editor' ];
type EditorView = Editor[ 'view' ];

const TOP_BAR_SELECTOR = '#elementor-editor-wrapper-v2';
const NAVIGATOR_SELECTOR = '#elementor-navigator';
const V4_EDITING_PANEL = 'main.MuiBox-root';
const V3_EDITING_PANEL = '#elementor-panel-content-wrapper';

const BLUR_TRIGGERING_SELECTORS = [ TOP_BAR_SELECTOR, NAVIGATOR_SELECTOR, V4_EDITING_PANEL, V3_EDITING_PANEL ];

export const CanvasInlineEditor = ( {
	elementClasses,
	initialValue,
	expectedTag,
	rootElement,
	id,
	setValue,
	onBlur,
}: {
	elementClasses: string;
	initialValue: string | null;
	expectedTag: string | null;
	rootElement: HTMLElement;
	id: string;
	setValue: ( value: string | null ) => void;
	onBlur: () => void;
} ) => {
	const [ hasSelectedContent, setHasSelectedContent ] = useState( false );
	const [ editor, setEditor ] = useState< Editor | null >( null );

	const onSelectionEnd = ( view: EditorView ) => {
		const hasSelection = ! view.state.selection.empty;

		setHasSelectedContent( hasSelection );
		queueMicrotask( () => view.focus() );
	};

	const onKeyDown = ( _: EditorView, event: KeyboardEvent ) => {
		if ( event.key === 'Escape' ) {
			onBlur();
		}

		if ( ( ! event.metaKey && ! event.ctrlKey ) || event.altKey ) {
			return;
		}

		if ( [ ITALIC_KEYBOARD_SHORTCUT, BOLD_KEYBOARD_SHORTCUT, UNDERLINE_KEYBOARD_SHORTCUT ].includes( event.key ) ) {
			event.stopPropagation();
		}
	};

	const asyncUnmountInlineEditor = React.useCallback( () => queueMicrotask( onBlur ), [ onBlur ] );

	useEffect( () => {
		BLUR_TRIGGERING_SELECTORS.forEach(
			( selector ) =>
				document?.querySelector( selector )?.addEventListener( 'mousedown', asyncUnmountInlineEditor )
		);

		return () =>
			BLUR_TRIGGERING_SELECTORS.forEach(
				( selector ) =>
					document?.querySelector( selector )?.removeEventListener( 'mousedown', asyncUnmountInlineEditor )
			);
	}, [ asyncUnmountInlineEditor ] );

	return (
		<ThemeProvider>
			<InlineEditingOverlay expectedTag={ expectedTag } rootElement={ rootElement } id={ id } />
			<InlineEditor
				onEditorCreate={ setEditor }
				editorProps={ {
					attributes: {
						style: 'outline: none;overflow-wrap: normal;',
					},
					handleDOMEvents: {
						mouseup: onSelectionEnd,
						keyup: onSelectionEnd,
						keydown: onKeyDown,
					},
				} }
				elementClasses={ elementClasses }
				value={ initialValue }
				setValue={ setValue }
				onBlur={ onBlur }
				autofocus
				expectedTag={ expectedTag }
			/>
			{ hasSelectedContent && editor && (
				<InlineEditingToolbarWrapper
					expectedTag={ expectedTag }
					editor={ editor }
					rootElement={ rootElement }
					id={ id }
				/>
			) }
		</ThemeProvider>
	);
};

const InlineEditingOverlay = ( {
	expectedTag,
	rootElement,
	id,
}: {
	expectedTag: string | null;
	rootElement: HTMLElement;
	id: string;
} ) => {
	const inlineEditedElement = getInlineEditorElement( rootElement, expectedTag );
	const [ overlayRefElement, setOverlayElement ] = useState< HTMLDivElement | null >( inlineEditedElement );

	useEffect( () => {
		setOverlayElement( getInlineEditorElement( rootElement, expectedTag ) );
	}, [ expectedTag, rootElement ] );

	return overlayRefElement ? <OutlineOverlay element={ overlayRefElement } id={ id } isSelected /> : null;
};

const InlineEditingToolbarWrapper = ( {
	expectedTag,
	editor,
	rootElement,
	id,
}: {
	expectedTag: string | null;
	editor: Editor;
	rootElement: HTMLElement;
	id: string;
} ) => {
	const [ element, setElement ] = useState< HTMLElement | null >( null );

	useEffect( () => {
		setElement( getInlineEditorElement( rootElement, expectedTag ) );
	}, [ expectedTag, rootElement ] );

	return element ? <InlineEditingToolbar element={ element } editor={ editor } id={ id } /> : null;
};

const InlineEditingToolbar = ( { element, editor, id }: { element: HTMLElement; editor: Editor; id: string } ) => {
	const { floating } = useFloatingOnElement( {
		element,
		isSelected: true,
	} );
	const { getFloatingProps, getReferenceProps } = useInteractions();

	useBindReactPropsToElement( element, getReferenceProps );

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ floating.setRef }
				style={ {
					...floating.styles,
					pointerEvents: 'none',
				} }
				role="presentation"
				{ ...getFloatingProps() }
			>
				{ floating.styles.transform && (
					<Box
						sx={ {
							position: 'relative',
							transform: 'translateY(-100%)',
							height: 'max-content',
						} }
					>
						<InlineEditorToolbar editor={ editor } elementId={ id } />
					</Box>
				) }
			</Box>
		</FloatingPortal>
	);
};

const getInlineEditorElement = ( rootElement: HTMLElement, tag: string | null ) => {
	return ! tag ? null : ( rootElement.querySelector( tag ) as HTMLDivElement );
};
