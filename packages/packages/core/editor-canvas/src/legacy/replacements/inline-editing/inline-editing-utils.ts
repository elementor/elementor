import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { type InlineEditorToolbarProps } from '@elementor/editor-controls';
import { type V1Element } from '@elementor/editor-elements';
import { type MiddlewareReturn, type MiddlewareState } from '@floating-ui/react';

import { type LegacyWindow } from '../../types';

const TOP_BAR_SELECTOR = '#elementor-editor-wrapper-v2';
const NAVIGATOR_SELECTOR = '#elementor-navigator';
const EDITING_PANEL = '#elementor-panel';

const EDITOR_ELEMENTS_OUT_OF_IFRAME = [ TOP_BAR_SELECTOR, NAVIGATOR_SELECTOR, EDITING_PANEL ];

export const EDITOR_WRAPPER_SELECTOR = 'inline-editor-wrapper';

const SELECTION_PSEUDO_ELEMENT_ID_PREFIX = 'selection-pseudo-element';

const SELECTION_PSEUDO_ELEMENT_STYLES: CSSProperties = {
	backgroundColor: 'transparent',
	border: 'none',
	outline: 'none',
	boxShadow: 'none',
	padding: '0',
	margin: '0',
	borderRadius: '0',
	overflow: 'hidden',
	opacity: '0',
	pointerEvents: 'none',
	position: 'absolute',
	display: 'block',
};

export type Editor = InlineEditorToolbarProps[ 'editor' ];
export type EditorView = Editor[ 'view' ];

export type Offsets = {
	left: number;
	top: number;
};

export const INLINE_EDITING_PROPERTY_PER_TYPE: Record< string, string > = {
	'e-button': 'text',
	'e-form-label': 'text',
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

export const legacyWindow = window as unknown as LegacyWindow;

export const getWidgetType = ( container: V1Element | null ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};

export const getInlineEditorElement = ( elementWrapper: HTMLElement, expectedTag: string | null ) => {
	return ! expectedTag ? null : ( elementWrapper.querySelector( expectedTag ) as HTMLDivElement );
};

// Elements out of iframe and canvas don't trigger "onClickAway" which unmounts the editor
// since they are not part of the iframes owner document.
// We need to manually add listeners to these elements to unmount the editor when they are clicked.
export const useOnClickOutsideIframe = ( handleUnmount: () => void ) => {
	const asyncUnmountInlineEditor = useCallback( () => queueMicrotask( handleUnmount ), [ handleUnmount ] );

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

export const useOnSelectionEnd = ( ownerDocument: Document, id: string ) => {
	const [ selectionPseudoElement, setSelectionPseudoElement ] = useState< HTMLElement | null >( null );

	const onSelectionEnd = ( view: EditorView ) => {
		const hasSelection = ! view.state.selection.empty;

		removeSelectionPseudoElement( ownerDocument, id );

		if ( hasSelection ) {
			setSelectionPseudoElement( createAndAttachSelectionPseudoElement( ownerDocument, id ) );
		} else {
			removeSelectionPseudoElement( ownerDocument, id );
			setSelectionPseudoElement( null );
		}
	};

	return { onSelectionEnd, selectionPseudoElement };
};

const createAndAttachSelectionPseudoElement = ( ownerDocument: Document, id: string ): HTMLElement | null => {
	const frameWindow = ownerDocument.defaultView;
	const selection = frameWindow?.getSelection();

	if ( ! selection ) {
		return null;
	}

	const range = selection.getRangeAt( 0 );
	const selectionRect = range.getBoundingClientRect();
	const bodyRect = ownerDocument.body.getBoundingClientRect();
	const selectionPseudoElement = ownerDocument.createElement( 'span' );

	setSelectionPseudoElementStyles( selectionPseudoElement, selectionRect, bodyRect );
	selectionPseudoElement.setAttribute( 'id', getSelectionElementId( id ) );

	ownerDocument.body.appendChild( selectionPseudoElement );

	return selectionPseudoElement;
};

export const removeSelectionPseudoElement = ( ownerDocument: Document, id: string ) => {
	const selectionPseudoElement = getSelectionPseudoElement( ownerDocument, id );

	if ( selectionPseudoElement ) {
		ownerDocument.body.removeChild( selectionPseudoElement );
	}
};

const getSelectionElementId = ( id: string ) => `${ SELECTION_PSEUDO_ELEMENT_ID_PREFIX }-${ id }`;

export const getSelectionPseudoElement = ( ownerDocument: Document, id: string ) =>
	ownerDocument.getElementById( getSelectionElementId( id ) ) as HTMLDivElement | null;

const setSelectionPseudoElementStyles = ( element: HTMLElement, selectionRect: DOMRect, bodyRect: DOMRect ) => {
	const { width, height } = selectionRect;

	Object.assign( element.style, SELECTION_PSEUDO_ELEMENT_STYLES );
	element.style.top = `${ selectionRect.top - bodyRect.top }px`;
	element.style.left = `${ selectionRect.left - bodyRect.left }px`;
	element.style.width = `${ width }px`;
	element.style.height = `${ height }px`;
};

export const horizontalShifterMiddleware: {
	name: string;
	fn: ( state: MiddlewareState ) => MiddlewareReturn;
} = {
	name: 'horizontalShifter',
	fn( state ) {
		const { x: left, y: top } = state;
		const { reference, floating } = state.elements;

		const referenceRect = reference.getBoundingClientRect();
		const floatingRect = floating.getBoundingClientRect();

		const newState: MiddlewareReturn = {
			...state,
			x: left,
			y: top,
		};

		const isLeftOverflown = state.x < 0 && referenceRect.left > state.x;

		if ( isLeftOverflown ) {
			newState.x = referenceRect.left;

			return newState;
		}

		const right = left + floatingRect.width;
		const documentWidth = ( reference as HTMLElement ).ownerDocument.body.offsetWidth;
		const isRightOverflown = right > documentWidth && referenceRect.right < floatingRect.right;

		if ( isRightOverflown ) {
			const diff = right - documentWidth;

			newState.x = left - diff;

			return newState;
		}

		return newState;
	},
};
