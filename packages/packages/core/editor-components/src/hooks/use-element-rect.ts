import { useEffect, useState } from 'react';
import { throttle } from '@elementor/utils';

export function useElementRect( element: HTMLElement | null ) {
	const [ rect, setRect ] = useState< DOMRect >( new DOMRect( 0, 0, 0, 0 ) );

	const onChange = throttle(
		() => {
			setRect( element?.getBoundingClientRect() ?? new DOMRect( 0, 0, 0, 0 ) );
		},
		20,
		true
	);

	useScrollListener( { element, onChange } );
	useResizeListener( { element, onChange } );
	useMutationsListener( { element, onChange } );

	useEffect(
		() => () => {
			onChange.cancel();
		},
		[ onChange ]
	);

	return rect;
}

type ListenerProps = {
	element: HTMLElement | null;
	onChange: () => void;
};

function useScrollListener( { element, onChange }: ListenerProps ) {
	useEffect( () => {
		if ( ! element ) {
			return;
		}

		const win = element.ownerDocument?.defaultView;
		win?.addEventListener( 'scroll', onChange, { passive: true } );

		return () => {
			win?.removeEventListener( 'scroll', onChange );
		};
	}, [ element, onChange ] );
}

function useResizeListener( { element, onChange }: ListenerProps ) {
	useEffect( () => {
		if ( ! element ) {
			return;
		}

		const resizeObserver = new ResizeObserver( onChange );
		resizeObserver.observe( element );

		const win = element.ownerDocument?.defaultView;
		win?.addEventListener( 'resize', onChange, { passive: true } );

		return () => {
			resizeObserver.disconnect();
			win?.removeEventListener( 'resize', onChange );
		};
	}, [ element, onChange ] );
}

function useMutationsListener( { element, onChange }: ListenerProps ) {
	useEffect( () => {
		if ( ! element ) {
			return;
		}

		const mutationObserver = new MutationObserver( onChange );
		mutationObserver.observe( element, { childList: true, subtree: true } );

		return () => {
			mutationObserver.disconnect();
		};
	}, [ element, onChange ] );
}
