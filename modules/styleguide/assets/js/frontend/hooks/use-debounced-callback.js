import { useRef, useCallback } from 'react';

export default function useDebouncedCallback( callback, wait ) {
	const timeout = useRef();

	return useCallback(
		( ...args ) => {
			const later = () => {
				clearTimeout( timeout.current );

				callback( ...args );
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ callback, wait ],
	);
}
