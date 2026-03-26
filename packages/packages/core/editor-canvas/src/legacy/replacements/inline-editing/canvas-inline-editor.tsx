import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { InlineEditor, InlineEditorToolbar } from '@elementor/editor-controls';
import { Box, ThemeProvider } from '@elementor/ui';
import { autoUpdate, flip, FloatingPortal, useFloating } from '@floating-ui/react';

import { CANVAS_WRAPPER_ID, OutlineOverlay } from '../../../components/outline-overlay';
import {
	type Editor,
	getInlineEditorElement,
	horizontalShifterMiddleware as horizontalShifter,
	useOnClickOutsideIframe,
	useRenderToolbar,
} from './inline-editing-utils';

export const CanvasInlineEditor = ( {
	elementClasses,
	initialValue,
	expectedTag,
	rootElement,
	contentElement,
	id,
	setValue,
	requestDestroy,
}: {
	elementClasses: string;
	initialValue: string | null;
	expectedTag: string | null;
	rootElement: HTMLElement;
	contentElement: HTMLElement;
	id: string;
	setValue: ( value: string | null ) => void;
	requestDestroy: () => void;
} ) => {
	const [ active, setActive ] = useState( true );
	const [ editor, setEditor ] = useState< Editor | null >( null );
	const { onSelectionEnd, anchor: toolbarAnchor, clearAnchor } = useRenderToolbar( rootElement.ownerDocument, id );

	useEffect( () => {
		if ( ! active ) {
			clearAnchor();
			requestDestroy();
		}
	}, [ active, clearAnchor, requestDestroy ] );

	const onBlur = useCallback( () => {
		setEditor( null );
		setActive( false );
	}, [] );

	useOnClickOutsideIframe( onBlur );

	if ( ! active ) {
		return null;
	}

	return (
		<ThemeProvider>
			<InlineEditingOverlay expectedTag={ expectedTag } rootElement={ rootElement } id={ id } />
			<InlineEditor
				onEditorCreate={ setEditor }
				mountElement={ contentElement }
				editorProps={ {
					attributes: {
						style: 'outline: none; display: inherit; justify-content: inherit; align-items: inherit; flex-direction: inherit; text-align: inherit;',
					},
				} }
				elementClasses={ elementClasses }
				value={ initialValue }
				setValue={ setValue }
				onBlur={ onBlur }
				autofocus
				onSelectionEnd={ onSelectionEnd }
			/>
			{ toolbarAnchor && editor && <InlineEditingToolbar anchor={ toolbarAnchor } editor={ editor } id={ id } /> }
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

const InlineEditingToolbar = ( { anchor, editor, id }: { anchor: HTMLElement; editor: Editor; id: string } ) => {
	const { refs, floatingStyles, isPositioned } = useFloating( {
		placement: 'top',
		strategy: 'fixed',
		transform: false,
		whileElementsMounted: autoUpdate,
		middleware: [ horizontalShifter, flip() ],
	} );

	useLayoutEffect( () => {
		refs.setReference( anchor );

		return () => refs.setReference( null );
	}, [ anchor, refs ] );

	return (
		<FloatingPortal id={ CANVAS_WRAPPER_ID }>
			<Box
				ref={ refs.setFloating }
				role="presentation"
				style={ {
					...floatingStyles,
					pointerEvents: 'none',
				} }
			>
				<InlineEditorToolbar editor={ editor } elementId={ id } />
			</Box>
		</FloatingPortal>
	);
};
