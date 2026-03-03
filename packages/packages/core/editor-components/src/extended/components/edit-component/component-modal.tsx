import * as React from 'react';
import { type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';

import { useCanvasDocument } from './use-canvas-document';
import { useElementRect } from './use-element-rect';

type ModalProps = {
	topLevelElementDom: HTMLElement | null;
	onClose: () => void;
};

export function ComponentModal( { topLevelElementDom, onClose }: ModalProps ) {
	const canvasDocument = useCanvasDocument();

	useEffect( () => {
		const handleEsc = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onClose();
			}
		};

		canvasDocument?.body.addEventListener( 'keydown', handleEsc );

		return () => {
			canvasDocument?.body.removeEventListener( 'keydown', handleEsc );
		};
	}, [ canvasDocument, onClose ] );

	if ( ! canvasDocument?.body ) {
		return null;
	}

	return createPortal(
		<>
			<BlockEditPage />
			<Backdrop canvas={ canvasDocument } element={ topLevelElementDom } onClose={ onClose } />
		</>,
		canvasDocument.body
	);
}

function Backdrop( {
	canvas,
	element,
	onClose,
}: {
	canvas: HTMLDocument;
	element: HTMLElement | null;
	onClose: () => void;
} ) {
	const rect = useElementRect( element );
	const clipPath = element ? getRectPath( rect, canvas.defaultView as Window ) : undefined;
	const backdropStyle: CSSProperties = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100vw',
		height: '100vh',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 999,
		pointerEvents: 'painted',
		cursor: 'pointer',
		clipPath,
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			onClose();
		}
	};

	return (
		<div
			style={ backdropStyle }
			onClick={ onClose }
			onKeyDown={ handleKeyDown }
			role="button"
			tabIndex={ 0 }
			aria-label={ __( 'Exit component editing mode', 'elementor' ) }
		/>
	);
}

function getRectPath( rect: DOMRect, viewport: Window ) {
	const { x, y, width, height } = rect;
	const { innerWidth: vw, innerHeight: vh } = viewport;

	const path = `path(evenodd, 'M 0 0 
		L ${ vw } 0
		L ${ vw } ${ vh }
		L 0 ${ vh }
		Z
		M ${ x } ${ y }
		L ${ x + width } ${ y }
		L ${ x + width } ${ y + height }
		L ${ x } ${ y + height }
		L ${ x } ${ y }
    	Z'
	)`;

	return path.replace( /\s{2,}/g, ' ' );
}

/**
 * when switching to another document id, we get a document handler when hovering
 * this functionality originates in Pro, and is intended for editing templates, e.g. header/footer
 * in components we don't want that, so the easy way out is to prevent it of being displayed via a CSS rule
 */
function BlockEditPage() {
	const blockV3DocumentHandlesStyles = `
	.elementor-editor-active {
		& .elementor-section-wrap.ui-sortable {
			display: contents;
		}

		& *[data-editable-elementor-document]:not(.elementor-edit-mode):hover {
			& .elementor-document-handle:not(.elementor-document-save-back-handle) {
				display: none;

				&::before,
				& .elementor-document-handle__inner {
					display: none;
				}
			}
		}
	}
	`;

	return <style data-e-style-id="e-block-v3-document-handles-styles">{ blockV3DocumentHandlesStyles }</style>;
}
