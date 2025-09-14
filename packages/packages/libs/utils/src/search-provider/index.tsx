import * as React from 'react';
import { createContext, useContext } from 'react';

import { useDebounceState } from '../use-debounce-state';

type SearchContextType = {
	debouncedValue: string;
	inputValue: string;
	handleChange: ( value: string ) => void;
	onClearSearch: () => void;
};

const SearchContext = createContext< SearchContextType | undefined >( undefined );

export const SearchProvider = ( {
	children,
	localStorageKey,
}: {
	children: React.ReactNode;
	localStorageKey?: string;
} ) => {
	const getInitialSearchValue = () => {
		if ( localStorageKey ) {
			const storedValue = localStorage.getItem( localStorageKey );
			if ( storedValue ) {
				localStorage.removeItem( localStorageKey );
				return storedValue;
			}
		}
		return '';
	};

	const onClearSearch = () => {
		handleChange( '' );
	};

	const { debouncedValue, inputValue, handleChange } = useDebounceState( {
		delay: 300,
		initialValue: getInitialSearchValue(),
	} );

	return (
		<SearchContext.Provider value={ { debouncedValue, inputValue, handleChange, onClearSearch } }>
			{ children }
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const context = useContext( SearchContext );
	if ( ! context ) {
		throw new Error( 'useSearch must be used within a SearchContextProvider' );
	}
	return context;
};
