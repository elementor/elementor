import { useEffect, useRef } from 'react';

export function useOnMount( cb: () => void ) {
	const mounted = useRef( false );

	useEffect( () => {
		if ( ! mounted.current ) {
			mounted.current = true;

			cb();
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
