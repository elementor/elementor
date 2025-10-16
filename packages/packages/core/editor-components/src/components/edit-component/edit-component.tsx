import * as React from 'react';
import { ForwardedRef, forwardRef, type HTMLProps, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCanvasIframeDocument } from '@elementor/editor-canvas';
import {
	__useNavigateToDocument as useNavigateToDocument,
	getV1DocumentsManager,
	type V1Document,
} from '@elementor/editor-documents';
import { __privateUseListenTo as useListenTo, commandEndEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { selectComponentsObject, selectLoadIsPending } from '../../store/store';

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Container = ( { isVisible, ...props }: HTMLProps< HTMLDivElement > & { isVisible : boolean } ) => (
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
		ref={ ref as ForwardedRef<HTMLDivElement> }
		{ ...props }
	/>
));

const ContentWrapper = forwardRef( ({ rect, ...props }: HTMLProps< HTMLDivElement > & { rect: Rect }, ref ) => (
	<div
		style={ {
			position: 'absolute',
			insetBlockStart: '0',
			insetInlineStart: '0',
            zIndex: '1000',
            top: (rect.y) + 'px',
            left: (rect?.x) + 'px',
            width: (rect?.width ?? 0) + 'px',
            height: (rect?.height ?? 0) + 'px',
		} }
        ref={ ref as ForwardedRef<HTMLDivElement> }
        {...props}
	/>
));

const Widget = forwardRef( ( props: HTMLProps< HTMLDivElement >, ref ) => (
	<div
		style={ {
            backgroundColor: '#fff',
		} }
		ref={ ref as ForwardedRef<HTMLDivElement> }
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
		const currentDocument = documentsManager.getCurrent();

		setCurrentDocument( currentDocument );
	} );

	const resetAndClosePopup = () => {
		const initialId = documentsManager.getInitialId();
		switchToDocument( initialId, { setAsInitial: false } );
	};

	const isComponent = ! isLoading && currentDocument ? !! components[ currentDocument.id ] : false;

    const widget = currentDocument?.container.view?.el as HTMLElement;
    const widgetParent = widget?.parentElement ?? null;

    if ( ! portal ) {
		return null;
	}

	return createPortal(
		isComponent && (
			<Container isVisible={ isComponent }>
				<Backdrop onClick={ resetAndClosePopup } />
                <PopoverContent 
                    isComponent={ isComponent } 
                    widget={ widget } 
                    widgetParent={ widgetParent }
                />
			</Container>
		),
		portal.body
	);
}

function usePortal() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument() );
}

type PopoverContentProps = {
	isComponent: boolean;
	widget: HTMLElement | null;
    widgetParent: HTMLElement | null;
};

function PopoverContent( { isComponent, widget, widgetParent }: PopoverContentProps ) {
    const wrapperRef = useRef< HTMLDivElement | null >( null );
	const contentRef = useRef< HTMLDivElement | null >( null );
    const widgetIndex = widget ? Array.from( widgetParent?.children ?? [] ).indexOf( widget ) ?? 0 : 0;

    useEffect( () => {
        if ( isComponent && widget && contentRef.current && wrapperRef.current ) {
            const widgetPlaceholder = createPlaceholder( widget );

            contentRef.current.appendChild( widget );

            wrapperRef.current.className = widgetParent?.className ?? '';

            widgetPlaceholder && widgetParent?.insertBefore( widgetPlaceholder, widgetParent?.children[ widgetIndex + 1 ] );
        }
	}, [ contentRef.current, wrapperRef.current, isComponent, widget ] );

    const rect = getRect(widgetParent);

	return (
        <ContentWrapper rect={ rect } >
            <div ref={ wrapperRef }><Widget ref={ contentRef } /></div>
        </ContentWrapper>
	);
}

function createPlaceholder( widget: HTMLElement) {
    const rect = widget.getBoundingClientRect();

    const placeholder = document.createElement( 'div' );
    placeholder.style.width = rect.width + 'px';
    placeholder.style.height = rect.height + 'px';
    return placeholder;
}

function getRect( element: HTMLElement | null ): Rect {
    const iframe = getCanvasIframeDocument();
    const document = iframe?.querySelector('html') as HTMLElement;

    const rect = element?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
    const x = rect.left + (document?.scrollLeft ?? 0);
    const y = rect.top + (document?.scrollTop ?? 0);

    return {
        x,
        y,
        width: rect.width,
        height: rect.height,
    }
}
