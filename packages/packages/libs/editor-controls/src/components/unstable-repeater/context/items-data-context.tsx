import * as React from 'react';
import { createContext, useState } from 'react';

type ItemsDataContextType = {
	values: Record< string, unknown >[];
	setValues: ( values: Record< string, unknown >[] ) => void;
};

const ItemsDataContext = createContext< ItemsDataContextType | null >( null );

export const useDataContext = () => {
	const context = React.useContext( ItemsDataContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		values: context.values,
		setValues: context.setValues,
	};
};

export const ItemsDataContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ values, setValues ] = useState< Record< string, unknown >[] >( [] );

	return <ItemsDataContext.Provider value={ { values, setValues } }>{ children }</ItemsDataContext.Provider>;
};
