import { useMemo } from 'react';

import { useFilterAndSortContext } from '../components/filter-and-sort/context';
import { type FilterKey } from '../components/filter-and-sort/types';
import { useFilteredCssClassUsage } from './use-filtered-css-class-usage';

export const useFilters = () => {
	const { checked } = useFilterAndSortContext();
	const allFilters = useFilteredCssClassUsage();

	// Collect only the active filter keys
	const activeKeys = Object.keys(checked).filter((key) => checked[key]) as FilterKey[];

	const intersection = useMemo(() => {
		if (activeKeys.length === 0) return null;

		// Start with the values of the first active filter
		return activeKeys
			.map((key) => allFilters[key] || [])
			.reduce((acc, arr) => acc.filter((val) => arr.includes(val)));
	}, [activeKeys, allFilters]);

	return intersection;
};
