import { useEffect, useMemo, useRef } from 'react';

import { debounce } from './debounce';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback< TArgs extends any[] >( callback: ( ...args: TArgs ) => void, delay: number ) {
	const callbackRef = useRef( callback );

	useEffect( () => {
		callbackRef.current = callback;
	}, [ callback ] );

	const debounced = useMemo(
		() => debounce( ( ...args: TArgs ) => callbackRef.current( ...args ), delay ),
		[ delay ]
	);

	useEffect( () => {
		return () => {
			debounced.cancel();
		};
	}, [ debounced ] );

	return debounced;
}
