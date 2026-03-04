import { useCallback, useEffect, useState } from 'react';

const DEFAULT_INTERVAL_MS = 3000;

export function useAutoplayCarousel< T >( items: T[], intervalMs = DEFAULT_INTERVAL_MS ) {
	const [ selectedItem, setSelectedItem ] = useState< T >( items[ 0 ] );
	const [ isAutoPlaying, setIsAutoPlaying ] = useState( true );

	const advanceToNextItem = useCallback( () => {
		setSelectedItem( ( current ) => {
			const currentIndex = items.indexOf( current );
			const nextIndex = ( currentIndex + 1 ) % items.length;
			return items[ nextIndex ];
		} );
	}, [ items ] );

	useEffect( () => {
		if ( ! isAutoPlaying ) {
			return;
		}

		const id = setInterval( advanceToNextItem, intervalMs );

		return () => clearInterval( id );
	}, [ isAutoPlaying, advanceToNextItem, intervalMs ] );

	const selectItem = useCallback( ( item: T ) => {
		setSelectedItem( item );
		setIsAutoPlaying( false );
	}, [] );

	return { selectedItem, selectItem };
}
