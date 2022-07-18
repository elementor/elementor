import { useRef, useCallback } from 'react';

export default function useDebouncedCallback( callback, wait ) {
	const timeout = useRef();

	return useCallback(
		( ...args ) => {
			const later = () => {
				clearTimeout( timeout.current );

				callback( ...args );
				elementorCommon.events.eventTracking(
					'kit-library/kit-free-search',
					{
						placement: 'kit library',
						event: 'search kit',
					},
					{
						source: 'home page',
						search_term: args[ 0 ],
						event_type: 'search',
					} );
			};

			clearTimeout( timeout.current );

			timeout.current = setTimeout( later, wait );
		},
		[ callback, wait ],
	);
}
