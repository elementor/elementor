import { useEffect } from 'react';

export function useTabFocus( callback ) {
	useEffect( () => {
		const handleVisibilityChange = () => {
			if ( 'visible' === document.visibilityState ) {
				callback();
			}
		};
		document.addEventListener( 'visibilitychange', handleVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', handleVisibilityChange );
	}, [ callback ] );
}
