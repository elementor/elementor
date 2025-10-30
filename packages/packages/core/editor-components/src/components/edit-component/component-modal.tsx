import * as React from 'react';
import { type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';

import { useCanvasDocument } from '../../hooks/use-canvas-document';
import { useElementRect } from '../../hooks/use-element-rect';

type ModalProps = {
	element: HTMLElement;
	onClose: () => void;
};
export function ComponentModal( { element, onClose }: ModalProps ) {
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
		<Backdrop canvas={ canvasDocument } element={ element } onClose={ onClose } />,
		canvasDocument.body
	);
}

function Backdrop( { canvas, element, onClose }: { canvas: HTMLDocument; element: HTMLElement; onClose: () => void } ) {
	const rect = useElementRect( element );
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
		clipPath: getRoundedRectPath( rect, canvas.defaultView as Window, 15 ),
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

function getRoundedRectPath( rect: DOMRect, viewport: Window, borderRadius: number ) {
	const { x, y, width, height } = rect;
	const radius = Math.min( borderRadius, width / 2, height / 2 );

	const { innerWidth: vw, innerHeight: vh } = viewport;

	const path = `path(evenodd, 'M 0 0 
		L ${ vw } 0
		L ${ vw } ${ vh }
		L 0 ${ vh }
		Z
		M ${ x + radius } ${ y }
		L ${ x + width - radius } ${ y }
		A ${ radius } ${ radius } 0 0 1 ${ x + width } ${ y + radius }
		L ${ x + width } ${ y + height - radius }
		A ${ radius } ${ radius } 0 0 1 ${ x + width - radius } ${ y + height }
		L ${ x + radius } ${ y + height }
		A ${ radius } ${ radius } 0 0 1 ${ x } ${ y + height - radius }
		L ${ x } ${ y + radius }
		A ${ radius } ${ radius } 0 0 1 ${ x + radius } ${ y }
    	Z'
	)`;

	return path.replace( /\s{2,}/g, ' ' );
}
