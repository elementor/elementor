import * as React from 'react';
import { createContext, type ReactElement, useCallback, useContext } from 'react';
import { useDebounceState } from '@elementor/utils';

type SearchContextType = {
	debouncedValue: string;
	inputValue: string;
	handleChange: ( value: string ) => void;
	onClearSearch: () => void;
	isSearchActive: boolean;
};

const SearchContext = createContext< SearchContextType | undefined >( undefined );

export const SearchContextProvider = ( { children }: { children: ReactElement } ) => {
	const { debouncedValue, inputValue, handleChange } = useDebounceState( {
		delay: 300,
		initialValue: '',
	} );

	const onClearSearch = useCallback( () => {
		handleChange( '' );
	}, [ handleChange ] );

	return (
		<SearchContext.Provider
			value={ {
				debouncedValue,
				inputValue,
				handleChange,
				onClearSearch,
				isSearchActive: inputValue.length < 2,
			} }
		>
			{ children }
		</SearchContext.Provider>
	);
};

export const useSearchContext = () => {
	const context = useContext( SearchContext );
	if ( ! context ) {
		throw new Error( 'useSearchContext must be used within a SearchContextProvider' );
	}
	return context;
};
