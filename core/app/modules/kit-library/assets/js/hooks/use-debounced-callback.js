import { useRef, useCallback } from 'react';

export default function useDebouncedCallback( callback, wait, searchEvent ) {
	const timeout = useRef();

	return useCallback(
		( ...args ) => {
			const later = () => {
				clearTimeout( timeout.current );

				callback( ...args );
				if ( searchEvent ) {
					searchEvent();
				}
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ callback, wait ],
	);
}
