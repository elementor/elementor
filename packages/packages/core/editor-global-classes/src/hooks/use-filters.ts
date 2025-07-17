import { useFilterAndSortContext } from '../components/filter-and-sort/context';
import { type FilterKey } from '../components/filter-and-sort/types';
import { useFilteredCssClassUsage } from './use-filtered-css-class-usage';

export const useFilters = () => {
	const { checked } = useFilterAndSortContext();
	const allFilters = useFilteredCssClassUsage();

	return ( Object.keys( checked ) as FilterKey[] ).reduce(
		( acc, key ) => {
			if ( checked[ key ] ) {
				acc[ key ] = allFilters[ key ];
			}
			return acc;
		},
		{} as Partial< Record< FilterKey, string[] > >
	);
};
