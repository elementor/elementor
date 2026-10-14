import * as React from 'react';
import { createContext, useContext } from 'react';
import { useSearchState, type UseSearchStateResult } from '@elementor/utils';

type SearchContextType = Pick< UseSearchStateResult, 'handleChange' | 'inputValue' > & {
	searchValue: UseSearchStateResult[ 'debouncedValue' ];
	clearSearch: () => void;
};

const SearchContext = createContext< SearchContextType | undefined >( undefined );

export const SearchProvider = ( {
	children,
	localStorageKey,
}: {
	children: React.ReactNode;
	localStorageKey: string;
} ) => {
	const { debouncedValue, handleChange, inputValue } = useSearchState( { localStorageKey } );

	const clearSearch = () => {
		handleChange( '' );
	};

	return (
		<SearchContext.Provider value={ { handleChange, clearSearch, searchValue: debouncedValue, inputValue } }>
			{ children }
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const context = useContext( SearchContext );
	if ( ! context ) {
		throw new Error( 'useSearch must be used within a SearchProvider' );
	}
	return context;
};
