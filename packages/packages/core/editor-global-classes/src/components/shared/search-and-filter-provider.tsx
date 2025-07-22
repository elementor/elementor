import * as React from 'react';
import { type FC } from 'react';

import { FilterAndSortProvider } from '../filter-and-sort/context';
import { SearchContextProvider } from '../search-css-class/context';

type SearchAndFilterProviderProps = {
	children: React.ReactElement;
};

export const SearchAndFilterProvider: FC< SearchAndFilterProviderProps > = ( { children } ) => {
	return (
		<SearchContextProvider>
			<FilterAndSortProvider>{ children }</FilterAndSortProvider>
		</SearchContextProvider>
	);
};
