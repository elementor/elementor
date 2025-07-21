import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useRepeaterContext } from './repeater-context';

type ItemsDataContextType< T > = {
	values?: T[];
	setValues: ( newValue: T[] ) => void;
};

const ItemsDataContext = createContext< ItemsDataContextType< unknown > | null >( null );

export const useDataContext = < T, >() => {
	const context = useContext( ItemsDataContext ) as ItemsDataContextType< T > | null;

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		values: context.values,
		setValues: context.setValues,
	};
};

export const ItemsDataContextProvider = < T, >( { children, initial }: { children: React.ReactNode; initial: T } ) => {
	const [ values, setValues ] = useState< T[] >( [] );
	const [ uniqueKeys, setUniqueKeys ] = useState( values.map( ( _, index ) => index ) );
	const { isOpen, setIsOpen } = useRepeaterContext();

	const generateNextKey = ( source: number[] ) => {
		return 1 + Math.max( 0, ...source );
	};

	const addRepeaterItem = useCallback( () => {
		const newItem = structuredClone( initial );
		const newKey = generateNextKey( uniqueKeys );

		setValues( [ ...values, newItem ] );
		setUniqueKeys( [ ...uniqueKeys, newKey ] );
	}, [ initial, uniqueKeys, values ] );

	useEffect( () => {
		if ( isOpen ) {
			addRepeaterItem();
			setIsOpen( false );
		}
	}, [ addRepeaterItem, isOpen, setIsOpen ] );

	return (
		<ItemsDataContext.Provider value={ { values, setValues } as ItemsDataContextType< unknown > }>
			{ children }
		</ItemsDataContext.Provider>
	);
};
