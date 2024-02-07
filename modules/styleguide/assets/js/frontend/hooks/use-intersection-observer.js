import { useEffect, useRef } from 'react';

export default function useIntersectionObserver( callback ) {
	const observer = useRef( null );
	let elements = [];

	useEffect( () => {
		observer.current = new IntersectionObserver( ( entries ) => {
			const intersectingArea = entries.find( ( entry ) => entry.isIntersecting );

			if ( intersectingArea ) {
				callback( intersectingArea );
			}
		}, {} );

		return () => {
			if ( observer.current ) {
				observer.current.disconnect();
			}
		};
	}, [] );

	const observe = () => {
		if ( elements.length !== 0 && observer.current ) {
			elements.forEach( ( element ) => {
				if ( element ) {
					observer.current.observe( element );
				}
			} );
		}
	};

	const unobserve = () => {
		if ( observer.current && elements.length !== 0 ) {
			elements.forEach( ( element ) => {
				if ( element ) {
					observer.current.unobserve( element );
				}
			} );
		}
	};

	const setObservedElements = ( observedElements ) => {
		unobserve();
		elements = observedElements;
		observe();
	};

	return {
		setObservedElements,
	};
}
