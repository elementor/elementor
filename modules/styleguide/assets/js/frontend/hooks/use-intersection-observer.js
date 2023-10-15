import { useEffect } from 'react';

export default function useIntersectionObserver( callback ) {
	let observer;
	let elements = [];

	useEffect( () => {
		observer = new IntersectionObserver( ( entries ) => {
			const intersectingArea = entries.find( ( entry ) => entry.isIntersecting );

			if ( intersectingArea ) {
				callback( intersectingArea );
			}
		}, {} );

		return () => {
			observer.disconnect();
		};
	}, [] );

	const observe = () => {
		if ( elements.length !== 0 ) {
			elements.forEach( ( element ) => {
				if ( element ) {
					observer.observe( element );
				}
			} );
		}
	};

	const unobserve = () => {
		if ( elements.length !== 0 ) {
			elements.forEach( ( element ) => {
				if ( element ) {
					observer.unobserve( element );
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
