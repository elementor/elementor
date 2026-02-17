import * as React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { InlineEditor, InlineEditorToolbar } from '@elementor/editor-controls';
import { Box, ThemeProvider } from '@elementor/ui';
import { autoUpdate, flip, FloatingPortal, useFloating } from '@floating-ui/react';

import { CANVAS_WRAPPER_ID, OutlineOverlay } from '../../../components/outline-overlay';
import {
	type Editor,
	getInlineEditorElement,
	horizontalShifterMiddleware as horizontalShifter,
	removeToolbarAnchor,
	useOnClickOutsideIframe,
	useRenderToolbar,
} from './inline-editing-utils';

const EDITOR_WRAPPER_SELECTOR = 'inline-editor-wrapper';

export const CanvasInlineEditor = ( {
	elementClasses,
	initialValue,
	expectedTag,
	rootElement,
	id,
	setValue,
	...props
}: {
	elementClasses: string;
	initialValue: string | null;
	expectedTag: string | null;
	rootElement: HTMLElement;
	id: string;
	setValue: ( value: string | null ) => void;
	onBlur: () => void;
} ) => {
	const [ editor, setEditor ] = useState< Editor | null >( null );
	const { onSelectionEnd, toolbarAnchor } = useRenderToolbar( rootElement.ownerDocument, id );

	const onBlur = () => {
		removeToolbarAnchor( rootElement.ownerDocument, id );

		props.onBlur();
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
			.${ EDITOR_WRAPPER_SELECTOR } .ProseMirror > button[contenteditable="true"] {
				height: auto;
				cursor: text;
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
				onSelectionEnd={ onSelectionEnd }
			/>
			{ toolbarAnchor && editor && (
				<InlineEditingToolbar element={ toolbarAnchor } editor={ editor } id={ id } />
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

const InlineEditingToolbar = ( { element, editor, id }: { element: HTMLElement; editor: Editor; id: string } ) => {
	const { refs, floatingStyles } = useFloating( {
		placement: 'top',
		strategy: 'fixed',
		transform: false,
		whileElementsMounted: autoUpdate,
		middleware: [ horizontalShifter, flip() ],
	} );

	useLayoutEffect( () => {
		refs.setReference( element );

		return () => refs.setReference( null );
	}, [ element, refs ] );

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box ref={ refs.setFloating } role="presentation" style={ { ...floatingStyles, pointerEvents: 'none' } }>
				<InlineEditorToolbar editor={ editor } elementId={ id } />
			</Box>
		</FloatingPortal>
	);
};
