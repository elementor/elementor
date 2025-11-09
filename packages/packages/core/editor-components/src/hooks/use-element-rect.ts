import { useEffect, useState } from 'react';
import { debounce, throttle } from '@elementor/utils';

export function useElementRect( element: HTMLElement | null ) {
	const [ rect, setRect ] = useState< DOMRect >( new DOMRect( 0, 0, 0, 0 ) );

	useEffect( () => {
		if ( ! element ) {
			setRect( new DOMRect( 0, 0, 0, 0 ) );
			return;
		}

		const throttledUpdated = throttle( () => {
			setRect( element.getBoundingClientRect() );
		}, 10 );

		const debouncedUpdate = debounce( () => {
			setRect( element.getBoundingClientRect() );
		}, 20 );

		debouncedUpdate();

		const resizeObserver = new ResizeObserver( debouncedUpdate );
		resizeObserver.observe( element );

		const mutationObserver = new MutationObserver( throttledUpdated );
		mutationObserver.observe( element, { childList: true, subtree: true } );

		const win = element.ownerDocument?.defaultView;
		win?.addEventListener( 'scroll', throttledUpdated, { passive: true } );
		win?.addEventListener( 'resize', debouncedUpdate, { passive: true } );

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			
			win?.removeEventListener( 'scroll', throttledUpdated );
			win?.removeEventListener( 'resize', debouncedUpdate );
		};
	}, [ element ] );

	return rect;
}
