import * as React from 'react';
import { createContext } from 'react';

type FilterAndSortContextType = {
	checked: Record< string, boolean >;
	setChecked: React.Dispatch< React.SetStateAction< Record< string, boolean > > >;
};

const FilterAndSortContext = createContext< FilterAndSortContextType | undefined >( undefined );

export const FilterAndSortProvider = ( { children } ) => {
	const [ checked, setChecked ] = React.useState< Record< string, boolean > >( {} );

	return (
		<FilterAndSortContext.Provider value={ { checked, setChecked } }>{ children }</FilterAndSortContext.Provider>
	);
};

export const useFilterAndSortContext = () => {
	const context = React.useContext( FilterAndSortContext );
	if ( ! context ) {
		throw new Error( 'useFilterAndSortContext must be used within a FilterAndSortProvider' );
	}
	return context;
};
