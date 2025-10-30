import { useEffect, useState } from 'react';
import { throttle } from '@elementor/utils';

export function useElementRect( element: HTMLElement | null ) {
	const [ rect, setRect ] = useState< DOMRect >( new DOMRect( 0, 0, 0, 0 ) );

	useEffect( () => {
		if ( ! element ) {
			setRect( new DOMRect( 0, 0, 0, 0 ) );
			return;
		}

		const update = throttle(() => {
			setRect( element.getBoundingClientRect() );
		}, 20);

		update();

		const resizeObserver = new ResizeObserver( update );
		resizeObserver.observe( element );

		const win = element.ownerDocument?.defaultView;
		win?.addEventListener( 'scroll', update, { passive: true } );
		win?.addEventListener( 'resize', update, { passive: true } );

		return () => {
			resizeObserver.disconnect();
			win?.removeEventListener( 'scroll', update );
			win?.removeEventListener( 'resize', update );
		};
	}, [ element ] );

	return rect;
}
