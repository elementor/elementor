import { type RefObject, useEffect, useState } from 'react';

export function useContainerWidth( ref: RefObject< HTMLElement | null > ) {
	const [ width, setWidth ] = useState( 0 );

	useEffect( () => {
		const element = ref.current;

		if ( ! element || typeof ResizeObserver === 'undefined' ) {
			return;
		}

		const observer = new ResizeObserver( ( entries ) => {
			const entry = entries[ 0 ];

			if ( entry ) {
				setWidth( entry.contentRect.width );
			}
		} );

		observer.observe( element );

		return () => observer.disconnect();
	}, [ ref ] );

	return width;
}
