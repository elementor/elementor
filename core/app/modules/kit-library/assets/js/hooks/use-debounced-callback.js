import { useRef, useCallback } from 'react';

export default function useDebouncedCallback( callback, wait, onFilter ) {
	const timeout = useRef();

	return useCallback(
		( ...args ) => {
			const later = () => {
				clearTimeout( timeout.current );

				callback( ...args );
				if ( onFilter ) {
					onFilter( ...args );
				}
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ callback, wait ],
	);
}
