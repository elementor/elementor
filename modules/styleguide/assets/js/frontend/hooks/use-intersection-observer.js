import { useEffect } from 'react';
import { useSettings } from '../contexts/settings';

export default function useIntersectionObserver( callback, observedElements ) {
	const { isReady } = useSettings();

	useEffect( () => {
		if ( ! isReady ) {
			return;
		}

		console.log( observedElements );

		const observer = new IntersectionObserver( ( entries ) => {
			const intersectingArea = entries.find( ( entry ) => entry.isIntersecting );

			if ( intersectingArea ) {
				callback( intersectingArea );
			}
		}, {} );

		observedElements.forEach( ( element ) => {
			if ( element ) {
				observer.observe( element );
			}
		} );

		return () => {
			observer.disconnect();
		};
	}, [ isReady ] );
}
