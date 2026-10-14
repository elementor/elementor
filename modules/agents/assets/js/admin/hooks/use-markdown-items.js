import { useEffect, useState } from 'react';

import { searchMarkdownItems } from '../api';

export const SEARCH_DEBOUNCE_MS = 300;

export const useMarkdownItems = ( { term = '', refreshKey = '', isPaused = false } ) => {
	const [ items, setItems ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		if ( isPaused ) {
			setIsLoading( false );
			return;
		}

		let isCurrent = true;
		const trimmedTerm = term.trim();

		const load = () => {
			searchMarkdownItems( trimmedTerm )
				.then( ( nextItems ) => {
					if ( isCurrent ) {
						setItems( nextItems );
					}
				} )
				.catch( () => {
					if ( isCurrent ) {
						setItems( [] );
					}
				} )
				.finally( () => {
					if ( isCurrent ) {
						setIsLoading( false );
					}
				} );
		};

		setIsLoading( true );

		if ( ! trimmedTerm ) {
			load();

			return () => {
				isCurrent = false;
			};
		}

		const timer = setTimeout( load, SEARCH_DEBOUNCE_MS );

		return () => {
			isCurrent = false;
			clearTimeout( timer );
		};
	}, [ term, refreshKey, isPaused ] );

	return { items, isLoading };
};
