import { useEffect } from 'react';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

export const useCanvasClickHandler = ( isActive: boolean, onClickAway: ( e: MouseEvent ) => void ) => {
	useEffect( () => {
		const canvasDocument = isActive ? getCanvasIframeDocument() : null;

		if ( ! canvasDocument ) {
			return;
		}

		canvasDocument.addEventListener( 'mousedown', onClickAway );

		return () => canvasDocument.removeEventListener( 'mousedown', onClickAway );
	}, [ isActive, onClickAway ] );
};
