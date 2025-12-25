import { useCallback, useRef } from 'react';

export function useDebouncedCallback< TArgs extends unknown[] >( callback: ( ...args: TArgs ) => void, wait: number ) {
	const timeout = useRef< ReturnType< typeof setTimeout > | undefined >();

	return useCallback(
		( ...args: TArgs ) => {
			const later = () => {
				clearTimeout( timeout.current );

				callback( ...args );
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ callback, wait ]
	);
}
