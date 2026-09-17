import { useEffect } from 'react';

export function useEscapeOnCanvas( canvasDocument: Document | null | undefined, onEscape: () => void ) {
	useEffect( () => {
		if ( ! canvasDocument ) {
			return;
		}

		const handleEsc = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				onEscape();
			}
		};

		canvasDocument.body.addEventListener( 'keydown', handleEsc );

		return () => {
			canvasDocument.body.removeEventListener( 'keydown', handleEsc );
		};
	}, [ canvasDocument, onEscape ] );
}
