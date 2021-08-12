import { useRef, useCallback } from 'react';

export default function useDebouncedCallback( func, wait ) {
	const timeout = useRef();

	return useCallback(
		( ...args ) => {
			const later = () => {
				clearTimeout( timeout.current );

				func( ...args );
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ func, wait ]
	);
}
