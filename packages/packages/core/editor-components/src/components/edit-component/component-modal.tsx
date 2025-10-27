import * as React from 'react';
import { type CSSProperties, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useElementRect } from '../../hooks/use-element-rect';
import { __ } from '@wordpress/i18n';
import { usePortal } from '../../hooks/use-portal';

type ModalProps = {
	element: HTMLElement;
	onClose: () => void;
};
export function ComponentModal( { element, onClose }: ModalProps ) {
	const portal = usePortal();

	useEffect( () => {
		const handleEsc = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onClose();
			}
		};

		portal?.body.addEventListener( 'keydown', handleEsc );

		return () => {
			portal?.body.removeEventListener( 'keydown', handleEsc );
		};
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	if ( ! portal?.body ) {
		return null;
	}

	return createPortal( <Backdrop iframe={ portal } element={ element } onClose={ onClose } />, portal.body );
}

function Backdrop( { iframe, element, onClose }: { iframe: HTMLDocument; element: HTMLElement; onClose: () => void } ) {
	const rect = useElementRect( element );
	const backdropStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100vw',
		height: '100vh',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 999,
		pointerEvents: 'painted',
		cursor: 'pointer',
		clipPath: getRoundedRectPath( rect, iframe.defaultView as Window, 15 ),
	} as CSSProperties;

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
			aria-label={ __('Exit component editing mode', 'elementor') }
		/>
	);
}

function getRoundedRectPath( rect: DOMRect, viewport: Window, borderRadius: number ) {
	const { x, y, width, height } = rect;
	const r = Math.min( borderRadius, width / 2, height / 2 );

	const { innerWidth: vw, innerHeight: vh } = viewport;

	const path = `path(evenodd, 'M 0 0 
		L ${ vw } 0
		L ${ vw } ${ vh }
		L 0 ${ vh }
		Z
		M ${ x + r } ${ y }
		L ${ x + width - r } ${ y }
		A ${ r } ${ r } 0 0 1 ${ x + width } ${ y + r }
		L ${ x + width } ${ y + height - r }
		A ${ r } ${ r } 0 0 1 ${ x + width - r } ${ y + height }
		L ${ x + r } ${ y + height }
		A ${ r } ${ r } 0 0 1 ${ x } ${ y + height - r }
		L ${ x } ${ y + r }
		A ${ r } ${ r } 0 0 1 ${ x + r } ${ y }
    	Z'
	)`;

	return path.replace( /\s{2,}/g, ' ' );
}
