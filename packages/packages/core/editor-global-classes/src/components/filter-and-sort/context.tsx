import * as React from 'react';
import { createContext } from 'react';
import { type ReactElement } from '@wordpress/element/build-types/serialize';

import { type CheckedFilters } from './types';

type FilterAndSortContextType = {
	checked: CheckedFilters;
	setChecked: React.Dispatch< React.SetStateAction< CheckedFilters > >;
	onReset: () => void;
};

const FilterAndSortContext = createContext< FilterAndSortContextType | undefined >( undefined );

const INIT_CHECKED_FILTERS: CheckedFilters = {
	empty: false,
	onThisPage: false,
	unused: false,
};

export const FilterAndSortProvider = ( { children }: { children: ReactElement } ) => {
	const [ checked, setChecked ] = React.useState< CheckedFilters >( INIT_CHECKED_FILTERS );

	const onReset = React.useCallback( () => {
		setChecked( INIT_CHECKED_FILTERS );
	}, [] );

	return (
		<FilterAndSortContext.Provider value={ { checked, setChecked, onReset } }>
			{ children }
		</FilterAndSortContext.Provider>
	);
};

export const useFilterAndSortContext = () => {
	const context = React.useContext( FilterAndSortContext );
	if ( ! context ) {
		throw new Error( 'useFilterAndSortContext must be used within a FilterAndSortProvider' );
	}
	return context;
};
