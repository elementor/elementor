import { useEffect, useState } from 'react';

export default function useIntersectionObserver( callback ) {
	let observer;
	let elements = [];

	useEffect( () => {
		console.log( 'useIntersectionObserver' );
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
		console.log( 'observe' );
		elements.forEach( ( element ) => {
			if ( element ) {
				observer.observe( element );
			}
		} );
	};

	const unobserve = () => {
		console.log( 'unobserve' );
		elements.forEach( ( element ) => {
			if ( element ) {
				observer.unobserve( element );
			}
		} );
	};

	const setObservedElements = ( observedElements ) => {
		elements = observedElements;
	};

	return {
		observe,
		unobserve,
		setObservedElements,
	};
}
