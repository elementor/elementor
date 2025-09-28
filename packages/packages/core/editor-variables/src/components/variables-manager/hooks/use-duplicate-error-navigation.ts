import { useCallback, useRef } from 'react';

export interface UseDuplicateErrorNavigationReturn {
	createNavigationCallback: ( duplicateIds: string[], onNavigate: ( id: string ) => void, onComplete: () => void ) => () => void;
	resetNavigation: () => void;
}

export const useDuplicateErrorNavigation = (): UseDuplicateErrorNavigationReturn => {
	const currentIndexRef = useRef( 0 );

	const createNavigationCallback = useCallback(
		( duplicateIds: string[], onNavigate: ( id: string ) => void, onComplete: () => void ) => {
			return () => {
				if ( ! duplicateIds?.length ) {
					return;
				}

				const currentIndex = currentIndexRef.current;
				const currentId = duplicateIds[ currentIndex ];
				
				if ( currentId ) {
					onNavigate( currentId );

					const nextIndex = currentIndex + 1;
					if ( nextIndex >= duplicateIds.length ) {
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
