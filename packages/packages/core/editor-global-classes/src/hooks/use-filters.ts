import { useMemo } from 'react';

import { useSearchAndFilters } from '../components/search-and-filter/context';
import { type FilterKey, useFilteredCssClassUsage } from './use-filtered-css-class-usage';

export const useFilters = () => {
	const {
		filters: { filters },
	} = useSearchAndFilters();
	const allFilters = useFilteredCssClassUsage();

	return useMemo( () => {
		const activeEntries = Object.entries( filters ).filter( ( [ , isActive ] ) => isActive ) as [
			FilterKey,
			true,
		][];

		if ( activeEntries.length === 0 ) {
			return null;
		}

		return activeEntries.reduce< string[] >( ( acc, [ key ], index ) => {
			const current = allFilters[ key ] || [];
			if ( index === 0 ) {
				return current;
			}
			return acc.filter( ( val ) => current.includes( val ) );
		}, [] );
	}, [ filters, allFilters ] );
};
