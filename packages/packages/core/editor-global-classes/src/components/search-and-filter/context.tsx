import * as React from 'react';
import { createContext, useContext } from 'react';
import { useDebounceState } from '@elementor/utils';

export type CheckedFilters = {
	empty: boolean;
	onThisPage: boolean;
	unused: boolean;
};

type SearchContextType = {
	debouncedValue: string;
	inputValue: string;
	handleChange: ( value: string ) => void;
	onClearSearch: () => void;
};
type FilterAndSortContextType = {
	filters: CheckedFilters;
	setFilters: React.Dispatch< React.SetStateAction< CheckedFilters > >;
	onClearFilter: () => void;
};

export type SearchAndFilterContextType = {
	search: SearchContextType;
	filters: FilterAndSortContextType;
};

const SearchAndFilterContext = createContext< SearchAndFilterContextType | undefined >( undefined );

const INIT_CHECKED_FILTERS: CheckedFilters = {
	empty: false,
	onThisPage: false,
	unused: false,
};

export const SearchAndFilterProvider = ( { children }: React.PropsWithChildren ) => {
	const [ filters, setFilters ] = React.useState< CheckedFilters >( INIT_CHECKED_FILTERS );
	const { debouncedValue, inputValue, handleChange } = useDebounceState( {
		delay: 300,
		initialValue: '',
	} );

	const onClearSearch = () => {
		handleChange( '' );
	};

	const onClearFilter = () => {
		setFilters( INIT_CHECKED_FILTERS );
	};

	return (
		<SearchAndFilterContext.Provider
			value={ {
				search: {
					debouncedValue,
					inputValue,
					handleChange,
					onClearSearch,
				},
				filters: {
					filters,
					setFilters,
					onClearFilter,
				},
			} }
		>
			{ children }
		</SearchAndFilterContext.Provider>
	);
};

export const useSearchAndFilters = () => {
	const context = useContext( SearchAndFilterContext );
	if ( ! context ) {
		throw new Error( 'useSearchContext must be used within a SearchContextProvider' );
	}
	return context;
};
