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

const TOOLBAR_REFERENCE_ELEMENT_ID_PREFIX = 'inline-editing-toolbar-reference';

const TOOLBAR_REFERENCE_ELEMENT_STYLES: CSSProperties = {
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
	const [ toolbarReferenceElement, setToolbarReferenceElement ] = useState< HTMLElement | null >( null );

	const onSelectionEnd = ( view: EditorView ) => {
		const hasSelection = ! view.state.selection.empty;

		removeToolbarReferenceElement( ownerDocument, id );

		if ( hasSelection ) {
			setToolbarReferenceElement( createAndAttachToolbarReferenceElement( ownerDocument, id ) );
		} else {
			setToolbarReferenceElement( null );
		}
	};

	return { onSelectionEnd, toolbarReferenceElement };
};

const createAndAttachToolbarReferenceElement = ( ownerDocument: Document, id: string ): HTMLElement | null => {
	const frameWindow = ownerDocument.defaultView;
	const selection = frameWindow?.getSelection();

	if ( ! selection ) {
		return null;
	}

	const range = selection.getRangeAt( 0 );
	const selectionRect = range.getBoundingClientRect();
	const bodyRect = ownerDocument.body.getBoundingClientRect();
	const toolbarReferenceElement = ownerDocument.createElement( 'span' );

	setToolbarReferenceElementStyles( toolbarReferenceElement, selectionRect, bodyRect );
	toolbarReferenceElement.setAttribute( 'id', getToolbarReferenceElementId( id ) );

	ownerDocument.body.appendChild( toolbarReferenceElement );

	return toolbarReferenceElement;
};

export const removeToolbarReferenceElement = ( ownerDocument: Document, id: string ) => {
	const toolbarReferenceElement = getToolbarReferenceElement( ownerDocument, id );

	if ( toolbarReferenceElement ) {
		ownerDocument.body.removeChild( toolbarReferenceElement );
	}
};

const getToolbarReferenceElementId = ( id: string ) => `${ TOOLBAR_REFERENCE_ELEMENT_ID_PREFIX }-${ id }`;

export const getToolbarReferenceElement = ( ownerDocument: Document, id: string ) =>
	ownerDocument.getElementById( getToolbarReferenceElementId( id ) ) as HTMLDivElement | null;

const setToolbarReferenceElementStyles = ( element: HTMLElement, selectionRect: DOMRect, bodyRect: DOMRect ) => {
	const { width, height } = selectionRect;

	Object.assign( element.style, TOOLBAR_REFERENCE_ELEMENT_STYLES );
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
		const {
			x: left,
			y: top,
			elements: { reference, floating },
		} = state;

		const newState: MiddlewareReturn = {
			...state,
			x: left,
			y: top,
		};

		const isLeftOverflown = left < 0;

		if ( isLeftOverflown ) {
			newState.x = 0;

			return newState;
		}

		const referenceRect = reference.getBoundingClientRect();
		const right = left + floating.offsetWidth;
		const documentWidth = ( reference as HTMLElement ).ownerDocument.body.offsetWidth;
		const isRightOverflown = right > documentWidth && referenceRect.right < right;

		if ( isRightOverflown ) {
			const diff = right - documentWidth;

			newState.x = left - diff;

			return newState;
		}

		return newState;
	},
};
