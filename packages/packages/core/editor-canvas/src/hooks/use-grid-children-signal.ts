import { useEffect, useState } from 'react';

export function useGridChildrenSignal( element: HTMLElement | null ): number {
	const [ signal, setSignal ] = useState( 0 );

	useEffect( () => {
		if ( ! element ) {
			return;
		}

		const bump = () => setSignal( ( previous ) => previous + 1 );

		const resizeObserver = new ResizeObserver( bump );
		const observed = new Set< Element >();

		const syncChildren = () => {
			for ( const child of Array.from( element.children ) ) {
				if ( ! observed.has( child ) ) {
					resizeObserver.observe( child );
					observed.add( child );
				}
			}

			for ( const child of observed ) {
				if ( child.parentElement !== element ) {
					resizeObserver.unobserve( child );
					observed.delete( child );
				}
			}
		};

		syncChildren();

		const mutationObserver = new MutationObserver( () => {
			syncChildren();
			bump();
		} );
		mutationObserver.observe( element, { childList: true } );

		return () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
			observed.clear();
		};
	}, [ element ] );

	return signal;
}
