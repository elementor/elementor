import * as React from 'react';
import { type CSSProperties } from 'react';

import { useElementRect } from '../hooks/use-element-rect';

type SpotlightBackdropProps = {
	canvas: Document;
	element: HTMLElement | null;
	onExit: () => void;
	ariaLabel: string;
};

export function SpotlightBackdrop( { canvas, element, onExit, ariaLabel }: SpotlightBackdropProps ) {
	const rect = useElementRect( element );
	const clipPath = element ? getRectClipPath( rect, canvas.defaultView as Window ) : undefined;

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
			onExit();
		}
	};

	return (
		<div
			style={ backdropStyle }
			onClick={ onExit }
			onKeyDown={ handleKeyDown }
			role="button"
			tabIndex={ 0 }
			aria-label={ ariaLabel }
		/>
	);
}

function getRectClipPath( rect: DOMRect, viewport: Window ) {
	const { x, y, width, height } = rect;
	const { innerWidth: vw, innerHeight: vh } = viewport;

	return `path(evenodd, 'M 0 0 L ${ vw } 0 L ${ vw } ${ vh } L 0 ${ vh } Z M ${ x } ${ y } L ${
		x + width
	} ${ y } L ${ x + width } ${ y + height } L ${ x } ${ y + height } L ${ x } ${ y } Z')`;
}
