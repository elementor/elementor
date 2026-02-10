import * as React from 'react';
import { useEffect, useState } from 'react';
import { InlineEditor, InlineEditorToolbar } from '@elementor/editor-controls';
import { Box, ThemeProvider } from '@elementor/ui';
import { FloatingPortal, useInteractions } from '@floating-ui/react';

import { CANVAS_WRAPPER_ID, OutlineOverlay } from '../../../components/outline-overlay';
import { useBindReactPropsToElement } from '../../../hooks/use-bind-react-props-to-element';
import { useFloatingOnElement } from '../../../hooks/use-floating-on-element';
import {
	calcSelectionCenterOffsets,
	type Editor,
	type EditorView,
	getComputedStyle,
	type Offsets,
} from './inline-editing-utils';

const TOP_BAR_SELECTOR = '#elementor-editor-wrapper-v2';
const NAVIGATOR_SELECTOR = '#elementor-navigator';
const EDITING_PANEL = '#elementor-panel';

const EDITOR_ELEMENTS_OUT_OF_IFRAME = [ TOP_BAR_SELECTOR, NAVIGATOR_SELECTOR, EDITING_PANEL ];

const EDITOR_WRAPPER_SELECTOR = 'inline-editor-wrapper';

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
	const [ selectionOffsets, setSelectionOffsets ] = useState< Offsets | null >( null );
	const [ editor, setEditor ] = useState< Editor | null >( null );

	const onSelectionEnd = ( view: EditorView ) => {
		const hasSelection = ! view.state.selection.empty;

		setSelectionOffsets( hasSelection ? calcSelectionCenterOffsets( view ) : null );
	};

	useOnClickOutsideIframe( onBlur );

	return (
		<ThemeProvider>
			<InlineEditingOverlay expectedTag={ expectedTag } rootElement={ rootElement } id={ id } />
			<style>
				{ `
			.ProseMirror > * {
				height: 100%;
			}
			` }
			</style>
			<InlineEditor
				onEditorCreate={ setEditor }
				editorProps={ {
					attributes: {
						style: 'outline: none;overflow-wrap: normal;height:100%',
					},
				} }
				elementClasses={ elementClasses }
				value={ initialValue }
				setValue={ setValue }
				onBlur={ onBlur }
				autofocus
				expectedTag={ expectedTag }
				wrapperClassName={ EDITOR_WRAPPER_SELECTOR }
				onSelectionEnd={ onSelectionEnd }
			/>
			{ selectionOffsets && editor && (
				<InlineEditingToolbarWrapper
					expectedTag={ expectedTag }
					editor={ editor }
					rootElement={ rootElement }
					id={ id }
					selectionOffsets={ selectionOffsets }
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
	selectionOffsets,
}: {
	expectedTag: string | null;
	editor: Editor;
	rootElement: HTMLElement;
	id: string;
	selectionOffsets: Offsets;
} ) => {
	const [ element, setElement ] = useState< HTMLElement | null >( null );

	useEffect( () => {
		setElement( getInlineEditorElement( rootElement, expectedTag ) );
	}, [ expectedTag, rootElement ] );

	return element ? (
		<InlineEditingToolbar element={ element } editor={ editor } id={ id } selectionOffsets={ selectionOffsets } />
	) : null;
};

const InlineEditingToolbar = ( {
	element,
	editor,
	id,
	selectionOffsets,
}: {
	element: HTMLElement;
	editor: Editor;
	id: string;
	selectionOffsets: Offsets;
} ) => {
	const { floating } = useFloatingOnElement( {
		element,
		isSelected: true,
	} );
	const { getFloatingProps, getReferenceProps } = useInteractions();
	const style = getComputedStyle( floating.styles, selectionOffsets );

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
				{ ...getFloatingProps( { style } ) }
			>
				{ floating.styles.transform && (
					<Box
						sx={ {
							position: 'relative',
							transform: 'translateY(-100%)',
							height: 'max-content',
						} }
					>
						<InlineEditorToolbar
							editor={ editor }
							elementId={ id }
							sx={ {
								transform: 'translateX(-50%)',
							} }
						/>
					</Box>
				) }
			</Box>
		</FloatingPortal>
	);
};

const getInlineEditorElement = ( elementWrapper: HTMLElement, expectedTag: string | null ) => {
	return ! expectedTag ? null : ( elementWrapper.querySelector( expectedTag ) as HTMLDivElement );
};

// Elements out of iframe and canvas don't trigger "onClickAway" which unmounts the editor
// since they are not part of the iframes owner document.
// We need to manually add listeners to these elements to unmount the editor when they are clicked.
const useOnClickOutsideIframe = ( handleUnmount: () => void ) => {
	const asyncUnmountInlineEditor = React.useCallback( () => queueMicrotask( handleUnmount ), [ handleUnmount ] );

	useEffect( () => {
		EDITOR_ELEMENTS_OUT_OF_IFRAME.forEach(
			( selector ) =>
				document?.querySelector( selector )?.addEventListener( 'mousedown', asyncUnmountInlineEditor )
		);

		return () =>
			EDITOR_ELEMENTS_OUT_OF_IFRAME.forEach(
				( selector ) =>
					document?.querySelector( selector )?.removeEventListener( 'mousedown', asyncUnmountInlineEditor )
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
};
