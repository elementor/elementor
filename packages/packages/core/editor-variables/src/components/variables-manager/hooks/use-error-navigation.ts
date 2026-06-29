import { useCallback, useRef } from 'react';

export interface UseErrorNavigationReturn {
	createNavigationCallback: (
		ids: string[],
		onNavigate: ( id: string ) => void,
		onComplete: () => void
	) => () => void;
	resetNavigation: () => void;
}

export const useErrorNavigation = (): UseErrorNavigationReturn => {
	const currentIndexRef = useRef( 0 );

	const createNavigationCallback = useCallback(
		( ids: string[], onNavigate: ( id: string ) => void, onComplete: () => void ) => {
			return () => {
				if ( ! ids?.length ) {
					return;
				}

				const currentIndex = currentIndexRef.current;
				const currentId = ids[ currentIndex ];

				if ( currentId ) {
					onNavigate( currentId );

					const nextIndex = currentIndex + 1;
					if ( nextIndex >= ids.length ) {
						onComplete();
						currentIndexRef.current = 0;
					} else {
						currentIndexRef.current = nextIndex;
					}
				}
			};
		},
		[]
	);

	const resetNavigation = useCallback( () => {
		currentIndexRef.current = 0;
	}, [] );

	return {
		createNavigationCallback,
		resetNavigation,
	};
};
