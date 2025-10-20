import * as React from 'react';
import { type ForwardedRef, forwardRef, type HTMLProps, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCanvasIframeDocument } from '@elementor/editor-canvas';
import {
	__useNavigateToDocument as useNavigateToDocument,
	getV1DocumentsManager,
	type V1Document,
} from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { selectComponentsObject, selectLoadIsPending } from '../../store/store';

type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

const Container = ( { isVisible, ...props }: HTMLProps< HTMLDivElement > & { isVisible: boolean } ) => (
	<div
		style={ {
			opacity: isVisible ? 1 : 0,
			transition: 'opacity 0.3s ease-in-out',
			pointerEvents: isVisible ? 'auto' : 'none',
			visibility: isVisible ? 'visible' : 'hidden',
		} }
		{ ...props }
	/>
);

const Backdrop = forwardRef( ( props: HTMLProps< HTMLDivElement >, ref ) => (
	<div
		style={ {
			position: 'absolute',
			insetBlockStart: '0',
			insetInlineStart: '0',
			width: '100%',
			height: '100%',
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			zIndex: '999',
			cursor: 'pointer',
		} }
		ref={ ref as ForwardedRef< HTMLDivElement > }
		{ ...props }
	/>
) );

const ContentWrapper = forwardRef( ( { rect, ...props }: HTMLProps< HTMLDivElement > & { rect: Rect }, ref ) => (
	<div
		style={ {
			position: 'absolute',
			insetBlockStart: '0',
			insetInlineStart: '0',
			zIndex: '1000',
			top: rect.y + 'px',
			left: rect?.x + 'px',
			width: ( rect?.width ?? 0 ) + 'px',
			height: ( rect?.height ?? 0 ) + 'px',
		} }
		ref={ ref as ForwardedRef< HTMLDivElement > }
		{ ...props }
	/>
) );

const Widget = forwardRef( ( { rect, ...props }: HTMLProps< HTMLDivElement > & { rect: Rect }, ref ) => (
	<div
		style={ {
			backgroundColor: '#fff',
			width: rect.width + 'px',
			height: rect.height + 'px',
		} }
		ref={ ref as ForwardedRef< HTMLDivElement > }
		{ ...props }
	/>
) );

export function EditComponent() {
	const switchToDocument = useNavigateToDocument();
	const portal = usePortal();
	const documentsManager = getV1DocumentsManager();

	const [ currentDocument, setCurrentDocument ] = useState< V1Document | null >( null );
	const components = useSelector( selectComponentsObject );
	const isLoading = useSelector( selectLoadIsPending );

	registerDataHook( 'after', 'editor/documents/attach-preview', () => {
		const nextDocument = documentsManager.getCurrent();

		if ( ! nextDocument ) {
			return;
		}

		if ( currentDocument?.id === nextDocument.id ) {
			return;
		}

		setCurrentDocument( nextDocument );
	} );

	const resetAndClosePopup = () => {
		const initialId = documentsManager.getInitialId();
		switchToDocument( initialId, { setAsInitial: false } );
	};

	const isComponent = ! isLoading && currentDocument ? !! components[ currentDocument.id ] : false;

	const widget = currentDocument?.container as V1Element;

	if ( ! portal ) {
		return null;
	}

	return createPortal(
		isComponent && (
			<Container isVisible={ isComponent } className="elementor">
				<Backdrop onClick={ resetAndClosePopup } />
				{ isComponent && <PopoverContent
					widget={ widget }
				/> }
			</Container>
		),
		portal.body
	);
}

function usePortal() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument() );
}

type PopoverContentProps = {
	widget: V1Element;
};

function PopoverContent( { widget }: PopoverContentProps ) {
	console.log('render', widget);
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const contentRef = useRef< HTMLDivElement | null >( null );

	const widgetEditorWrapper = widget.view?.el as HTMLElement | null;
	const widgetParent = widgetEditorWrapper?.parentElement as HTMLElement | null;
	const actualWidget = widgetEditorWrapper?.children[ 0 ] as HTMLElement | null;

	useEffect( () => {
		const widgetPlaceholder = actualWidget ? createPlaceholder( actualWidget ) : null;

		if (
			widget &&
			widgetPlaceholder &&
			widgetEditorWrapper &&
			contentRef.current &&
			wrapperRef.current
		) {
			
			// Clone widgetParent with all its calculated styles
			if ( widgetParent ) {
				cloneElementStyles( widgetParent, wrapperRef.current );
				cloneElementStyles( widgetEditorWrapper, contentRef.current );
				contentRef.current.style.backgroundColor = '#fff';
				
				// widgetParent.insertBefore( widgetPlaceholder, widgetParent?.children[ widgetIndex ] );
				
				widgetEditorWrapper.replaceWith( widgetPlaceholder );
			}

			contentRef.current.appendChild( widgetEditorWrapper );
		}

		return () => {
			console.log('unmount', {widgetPlaceholder, contentRef: contentRef.current, widgetEditorWrapper});
			if ( widgetPlaceholder && widgetEditorWrapper ) {
				widgetPlaceholder.replaceWith( widgetEditorWrapper );
			}
		};
	}, [ contentRef.current, wrapperRef.current, widget, widgetEditorWrapper, widgetParent ] );

	const rect = getRect( widgetParent );
	const widgetRect = getRect( actualWidget );

	return (
		<ContentWrapper rect={ rect }>
			<div ref={ wrapperRef }>
				<Widget ref={ contentRef } rect={ widgetRect } />
			</div>
		</ContentWrapper>
	);
}

function createPlaceholder( widget: HTMLElement ): HTMLDivElement {
	const rect = widget.getBoundingClientRect();

	const placeholder = document.createElement( 'div' );
	placeholder.style.width = rect.width + 'px';
	placeholder.style.height = rect.height + 'px';
	return placeholder;
}

function cloneElementStyles( sourceElement: HTMLElement, targetElement: HTMLElement ): void {
	// Copy all computed styles from source to target
	const computedStyles = window.getComputedStyle( sourceElement );

	// Copy all CSS properties
	for ( let i = 0; i < computedStyles.length; i++ ) {
		const property = computedStyles[ i ];
		const value = computedStyles.getPropertyValue( property );
		targetElement.style.setProperty( property, value );
	}
}

function getRect( element: HTMLElement | null ): Rect {
	const iframe = getCanvasIframeDocument();
	const document = iframe?.querySelector( 'html' ) as HTMLElement;

	const rect = element?.getBoundingClientRect() ?? new DOMRect( 0, 0, 0, 0 );
	const x = rect.left + ( document?.scrollLeft ?? 0 );
	const y = rect.top + ( document?.scrollTop ?? 0 );

	return {
		x,
		y,
		width: rect.width,
		height: rect.height,
	};
}
