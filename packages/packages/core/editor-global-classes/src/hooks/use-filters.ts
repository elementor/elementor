import { useMemo } from 'react';

import { useSearchAndFilters } from '../components/search-and-filter/context';
import { type FilterKey } from '../components/search-and-filter/types';
import { useFilteredCssClassUsage } from './use-filtered-css-class-usage';

export const useFilters = () => {
	const {
		filters: { filters },
	} = useSearchAndFilters();
	const allFilters = useFilteredCssClassUsage();

	// Collect only the active filter keys
	const activeKeys = Object.keys( filters ).filter( ( key ) => filters[ key as FilterKey ] ) as FilterKey[];

	return useMemo( () => {
		if ( activeKeys.length === 0 ) {
			return null;
		}

		// Start with the values of the first active filter
		return activeKeys
			.map( ( key ) => allFilters[ key ] || [] )
			.reduce( ( acc, arr ) => acc.filter( ( val ) => arr.includes( val ) ) );
	}, [ activeKeys, allFilters ] );
};
